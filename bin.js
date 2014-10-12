#!/usr/bin/env node

'use strict';

var concat = require('concat-stream')
  , prompt = require('cli-prompt')
  , uniq = require('uniq')
  , ps = require('ps')
  , fzip = require('fzip');

var spawn = require('child_process').spawn
  , util = require('util');


var usage = function () {
  util.puts('Usage:  killsome <name>');
};


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
  if (argv.length != 1) {
    usage();
    process.exit(1);
  }
  var procname = argv[0];

  spawn('pgrep', ['-x', procname], {
    stdio: 'pipe'
  }).stdout.pipe(concat({ encoding: 'string' }, function (pids) {
    pids = pids.trim().split(/\s+/).map(Number);

    (function printPstrees(pids, index, cb) {
      if (index < pids.length) {
        util.print(index + ') ');
        printProcessInfo(pids[index], printPstrees.bind(null, pids, index + 1, cb));
      }
      else {
        cb();
      }
    }(pids, 0, function () {

      prompt('kill: ', function (indices) {
        // If there are no more than 10 matches, a string of digits is a perfectly valid input.
        // Otherwise, choices must be separated by commas or spaces.

        if (pids.length <= 10) {
          indices = indices.match(/\d/g);
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
}(process.argv.slice(2)));