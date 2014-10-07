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

    if (10 <= pids.length) {
      output.error('More than 10 processes found. I can\'t handle it.');
      process.exit(1);
    }

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
        indices = uniq(indices.trim().split(''));

        (function killLoop() {
          if (indices.length) {
            spawn('kill', [pids[indices.shift()]]).on('exit', killLoop);
          }
        }());
      });
    }));
  }));
}(process.argv.slice(2)));