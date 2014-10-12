# killsome [![Dependency Status][david-badge]][david] [![DevDependency Status][david-dev-badge]][david-dev]

[![npm](https://nodei.co/npm/killsome.png)](https://nodei.co/npm/killsome/)

[david-badge]: https://david-dm.org/eush77/killsome.png
[david]: https://david-dm.org/eush77/killsome
[david-dev-badge]: https://david-dm.org/eush77/killsome/dev-status.png
[david-dev]: https://david-dm.org/eush77/killsome#info=devDependencies

Kill processes by name interactively (like `killall`, except that not necessarily all and interactive by design).

Processes are to be distinguished from one another by threads and subprocesses they forked, using output from `pstree`.

## CLI

Usage: `killsome <name>`.

You will be presented with all found instances and process trees they are roots of.

```
$ killsome fish
0) pid=2699
fish---7*[{fish}]

1) pid=4808
fish---emacs

2) pid=6097
fish---python2.7---{python2.7}

3) pid=9985
fish---node---{node}

4) pid=17165
fish-+-emacs
     `-node-+-pstree
            `-{node}

5) pid=19879
fish---man---less

kill:
```

Enter indices of instances to kill, in a single line (e.g. `1`, `01`, `012`). Here, `fish` with 7 threads is the process I would kill, so I enter `0`.

If there are no more than 10 matches, a string of digits is a perfectly valid input. Otherwise, choices must be separated by commas or spaces: `1 2 12`, `1,2,12`, or any possible combination.

## Install

```shell
npm install -g killsome
```

## License

MIT