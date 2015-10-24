#!/usr/bin/env node

'use strict';

var concat = require('concat-stream')
  , prompt = require('cli-prompt')
  , uniq = require('uniq')
  , ps = require('ps')
  , fzip = require('fzip')
  , obj = require('obj')
  , debug = require('debug')('killsome');

var spawn = require('child_process').spawn
  , format = require('util').format;


var name = require('./package.json').name
  , version = require('./package.json').version;

var argv = require('yargs-dashed')
             .strict()
             .usage(format('Usage:  %s [-<SIGNAL>] [option]... <name>', name))
             .help('help', 'Print this message')
             .version(version, 'version', 'Print version number')
             .demand(1)

             .dashed('signal')
             .option('signal', {
               default: 'TERM',
               description: 'Signal to be sent'
             })
             .check(obj(function (argv) {
               return !Array.isArray(argv.signal);
             }).set('toString', function () {
               return '--signal set multiple times';
             }).get())

             .options({
               pid: {
                 alias: 'p',
                 boolean: true,
                 default: true,
                 description: 'Show PID'
               },
               ppid: {
                 alias: 'P',
                 boolean: true,
                 default: false,
                 description: 'Show PPID'
               },
               user: {
                 alias: 'u',
                 boolean: true,
                 default: false,
                 description: 'Show EUSER'
               },
               command: {
                 alias: 'c',
                 boolean: true,
                 default: false,
                 description: 'Show COMMAND'
               },
               start: {
                 alias: 's',
                 boolean: true,
                 default: true,
                 description: 'Show START'
               },
               cpu: {
                 alias: 'C',
                 boolean: true,
                 default: false,
                 description: 'Show %CPU'
               },
               mem: {
                 alias: 'M',
                 boolean: true,
                 default: false,
                 description: 'Show %MEM'
               },
               tty: {
                 alias: 'T',
                 boolean: true,
                 default: false,
                 description: 'Show TTY'
               }
             })
             .option('all', {
               boolean: true,
               description: 'Show all'
             })
             .argv;


var psKeyMap = [
  { arg: 'pid', key: 'pid'},
  { arg: 'ppid', key: 'ppid'},
  { arg: 'user', key: 'euser'},
  { arg: 'command', key: 'comm'},
  { arg: 'start', key: 'start'},
  { arg: 'cpu', key: '%cpu'},
  { arg: 'mem', key: '%mem'},
  { arg: 'tty', key: 'tty'},
];


var printProcessInfo = function(pid, keys, cb) {
  if (typeof keys == 'function') {
    cb = keys;
    keys = null;
  }
  keys = keys || ['pid'];

  ps.lookup({
    pid: pid,
    format: keys.join(' '),
    parse: true
  }, function (err, psinfo) {
    if (err) throw err;
    psinfo = psinfo[0];

    var status = fzip(keys, psinfo, function (key, value) {
      return [key, value].join('=');
    }).join(', ');
    console.log(status);

    spawn('pstree', [pid], {
      stdio: 'pipe'
    }).stdout.pipe(concat({ encoding: 'string' }, function (tree) {
      console.log(tree);
      cb();
    }));
  });
};


(function (argv) {
  var procname = argv._[0];
  var signal = argv.signal;

  var psKeys = psKeyMap.map(function (option) {
    return (argv.all || argv[option.arg]) ? option.key : null;
  }).filter(Boolean);

  spawn('pgrep', ['-x', procname], {
    stdio: 'pipe'
  }).stdout.pipe(concat({ encoding: 'string' }, function (pids) {
    pids = pids.trim().split(/\s+/).map(Number);

    (function printPstrees(pids, index, cb) {
      if (index < pids.length) {
        process.stdout.write(index + ') ');
        printProcessInfo(pids[index], psKeys, printPstrees.bind(null, pids, index + 1, cb));
      }
      else {
        cb();
      }
    }(pids, 0, function () {

      prompt('kill: ', function (indices) {
        // If there are no more than 10 matches, a string of digits is
        // a perfectly valid input. Otherwise, choices must be separated
        // by commas or spaces.

        if (pids.length <= 10) {
          indices = indices.match(/\d/g) || [];
        }
        else {
          indices = indices.replace(/,/g, ' ')
                           .replace(/[^\d\s]+/g, '')
                           .trim()
                           .split(/\s+/)
          // Mapping to Number will equate 1 and 01.
                           .map(Number);
        }

        indices = uniq(indices);

        (function killLoop() {
          if (indices.length) {
            var killArgs = ['-' + signal, pids[indices.shift()]];
            debug('kill %s', killArgs.join(' '));
            spawn('kill', killArgs)
              .on('exit', killLoop);
          }
        }());
      });
    }));
  }));
}(argv));
