#!/usr/bin/env node

'use strict';

var concat = require('concat-stream')
  , prompt = require('cli-prompt')
  , uniq = require('uniq')
  , output = require('simple-output');

var spawn = require('child_process').spawn
  , util = require('util');

output.stdout = output.stderr;


(function (argv) {
  if (argv.length != 1) {
    output.info('Usage: ' + process.argv[1] + ' <name>');
    process.exit(1);
  }
  var procname = argv[0];

  spawn('pgrep', ['-x', procname], {
    stdio: 'pipe'
  }).stdout.pipe(concat({ encoding: 'string' }, function (pids) {
    pids = pids.trim().split(/\s+/).map(Number);

    (function printPstrees(pids, index, cb) {
      if (index < pids.length) {
        spawn('pstree', [pids[index]], {
          stdio: 'pipe'
        }).stdout.pipe(concat({ encoding: 'string' }, function (tree) {
          util.puts(index + ') ' + tree.trim().replace(/\n/g, '\n   '));
          printPstrees(pids, index + 1, cb);
        }));
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