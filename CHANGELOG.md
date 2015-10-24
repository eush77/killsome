0.1.3 / 2015-10-24
==================

  * Add arguments to --command output (#3)
  * Output nothing if no processes found (#4)

0.1.2 / 2015-10-24
==================

  * Use `-TERM` argument for kill(1) instead of `--signal TERM`

0.1.0 / 2014-10-13
==================

  * Accept signal to send (close [#2](https://github.com/eush77/killsome/issues/2))

0.0.5 / 2014-10-13
==================

  * Rename `--time` to `--start` for clarity

0.0.4 / 2014-10-12
==================

  * Add `--all`
  * Add CLI options to tweak printProcessInfo (close [#1](https://github.com/eush77/killsome/issues/1)):
	`--pid`, `--ppid`, `--user`, `--command`, `--time`, `--cpu`, `--mem`, `--tty`

0.0.3 / 2014-10-12
==================

  * Fix issue with empty input
  * Print PIDs (address [#1](https://github.com/eush77/killsome/issues/1))

0.0.2 / 2014-10-08
==================

  * Fix program name in the usage string
  * Split input by commas and spaces

0.0.1 / 2014-10-08
==================

  * Make initial release
