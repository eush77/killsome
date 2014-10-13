# killsome [![Dependency Status][david-badge]][david] [![DevDependency Status][david-dev-badge]][david-dev]

[![npm](https://nodei.co/npm/killsome.png)](https://nodei.co/npm/killsome/)

[david-badge]: https://david-dm.org/eush77/killsome.png
[david]: https://david-dm.org/eush77/killsome
[david-dev-badge]: https://david-dm.org/eush77/killsome/dev-status.png
[david-dev]: https://david-dm.org/eush77/killsome#info=devDependencies

Kill processes by name interactively (like `killall`, except that not necessarily all and interactive by design).

Processes are to be distinguished from one another by threads and subprocesses they forked (`pstree` output), as well as usual process parameters such as PID, launch time, etc.

## CLI

```
Usage:  killsome [option]... <name>

Options:
  --help         Print this message
  --version      Print version number
  --pid, -p      Show PID              [default: true]
  --ppid, -P     Show PPID             [default: false]
  --user, -u     Show EUSER            [default: false]
  --command, -c  Show COMMAND          [default: false]
  --start, -s    Show START            [default: true]
  --cpu, -C      Show %CPU             [default: false]
  --mem, -M      Show %MEM             [default: false]
  --tty, -T      Show TTY              [default: false]
  --all          Show all
```

Every boolean option can be negated with `--no-`, e.g. `killsome --no-pid <name>`.

## Example

```
$ killsome fish
```

You will be presented with all found instances and process trees they are roots of.

```
0) pid=4808, start=23:26:18
fish---emacs

1) pid=5780, start=14:20:07
fish-+-emacs
     `-node-+-pstree
            `-{node}

2) pid=6097, start=23:46:26
fish---python2.7---{python2.7}

3) pid=9985, start=00:33:45
fish---9*[{fish}]

4) pid=13113, start=16:14:26
fish

5) pid=14896, start=16:31:22
fish---man---less

kill:
```

Enter indices of instances to kill, in a single line (e.g. `1`, `01`, `012`). Here, `fish` with 9 threads is the process I would kill, so I enter `3`.

If there are no more than 10 matches, a string of digits is a perfectly valid input. Otherwise, choices must be separated by commas or spaces: `1 2 12`, `1,2,12`, or any possible combination.

## Install

```shell
npm install -g killsome
```

## License

MIT