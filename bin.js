#!/usr/bin/env node

'use strict';

var concat = require('concat-stream')
  , prompt = require('cli-prompt')
  , uniq = require('uniq')
  , ps = require('ps')
  , fzip = require('fzip');

var spawn = require('child_process').spawn
  , util = require('util');


var name = require('./package.json').name
  , version = require('./package.json').version;

var argv = require('yargs')
             .usage(util.format('Usage:  %s [option]... <name>', name))
             .help('help', 'Print this message')
             .version(version, 'version', 'Print version number')
             .demand(1)
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
               time: {
                 alias: 't',
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
             .options('all', {
               boolean: true,
               description: 'Show all'
             })
             .argv;


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
    util.puts(status);

    spawn('pstree', [pid], {
      stdio: 'pipe'
    }).stdout.pipe(concat({ encoding: 'string' }, function (tree) {
      util.puts(tree);
      cb();
    }));
  });
};


(function (argv) {
  var procname = argv._[0];

  var optset = function (key) {
    return argv.all || argv[key];
  };

  var psKeys = [].concat(optset('pid') ? ['pid'] : [],
                         optset('ppid') ? ['ppid'] : [],
                         optset('user') ? ['euser'] : [],
                         optset('command') ? ['comm'] : [],
                         optset('time') ? ['start'] : [],
                         optset('cpu') ? ['%cpu'] : [],
                         optset('mem') ? ['%mem'] : [],
                         optset('tty') ? ['tty'] : []);

  spawn('pgrep', ['-x', procname], {
    stdio: 'pipe'
  }).stdout.pipe(concat({ encoding: 'string' }, function (pids) {
    pids = pids.trim().split(/\s+/).map(Number);

    (function printPstrees(pids, index, cb) {
      if (index < pids.length) {
        util.print(index + ') ');
        printProcessInfo(pids[index], psKeys, printPstrees.bind(null, pids, index + 1, cb));
      }
      else {
        cb();
      }
    }(pids, 0, function () {

      prompt('kill: ', function (indices) {
        // If there are no more than 10 matches, a string of digits is a perfectly valid input.
        // Otherwise, choices must be separated by commas or spaces.

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
            spawn('kill', [pids[indices.shift()]]).on('exit', killLoop);
          }
        }());
      });
    }));
  }));
}(argv));