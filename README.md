# killsome [![Dependency Status][david-badge]][david] [![DevDependency Status][david-dev-badge]][david-dev]

[david-badge]: https://david-dm.org/eush77/regex-format.png
[david]: https://david-dm.org/eush77/regex-format
[david-dev-badge]: https://david-dm.org/eush77/regex-format/dev-status.png
[david-dev]: https://david-dm.org/eush77/regex-format#info=devDependencies

Kill processes by name interactively (like `killall`, except that not necessarily all and interactive by design).

Processes are to be distinguished from one another by threads and subprocesses they forked, using output from `pstree`.

## CLI

Usage: `killsome <name>`.

You will be presented with all found instances and process trees they are roots of.

```
$ killsome fish                                                                                                                                          01:08:00
0) fish---emacs
1) fish---node-+-pstree
               `-{node}
2) fish---19*[{fish}]
kill:
```

Enter indices of instances to kill, in a single line (e.g. `1`, `01`, `012`). Here, `fish` with 19 threads is the process I would kill, so I enter `2`.

## License

MIT