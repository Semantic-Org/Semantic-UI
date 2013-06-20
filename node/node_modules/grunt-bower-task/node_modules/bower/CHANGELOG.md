# Changelog

## 0.9.2 - 2013-04-28
- Better fix for #429

## 0.9.1 - 2013-04-27
- Update `package.json`, docs and other stuff to point to the new `Bower` organisation on GitHub
- Fix root label of `bower list` being an absolute path; now uses the package name
- Fix `bower update <pkg>` updating all packages; now throws when updating an unknown package
- Fix `list` command when package use different names than the `guessed` one ([#429](https://github.com/bower/bower/issues/429))

## 0.9.0 - 2013-04-25
- __Change from `component.json` to `bower.json`__ ([#39](https://github.com/bower/bower/issues/39))
- __Compatibility with `node 0.10.x`, including fix hangs/errors when extracting `zip` files__
- Fix `--save` and `--save-dev` not working with URLs that get redirected ([#417](https://github.com/bower/bower/issues/417))
- Fix `init` command targeting `~commit` instead of `*`. ([#385](https://github.com/bower/bower/issues/385))
- Remove temporary directories before exiting ([#345](https://github.com/bower/bower/issues/345))
- Integrate `update-notifier` ([#202](https://github.com/bower/bower/issues/202))
- Use `json` name when a package name was inferred ([#192](https://github.com/bower/bower/issues/192))
- Fix `bin/bower` not exiting with an exit code greater than zero when an error occurs ([#187](https://github.com/bower/bower/issues/187))
- Fix `--save` and `--save-dev` saving resolved shorthands instead of the actual shorthands
- Fix bower using user defined git templates ([#324](https://github.com/bower/bower/issues/324))
- Add command abbreviations ([#262](https://github.com/bower/bower/issues/262))
- Improve help messages and fix abuse of colors in output
- Wait for every package to resolve before printing error messages ([#290](https://github.com/bower/bower/issues/290))
- Add `shorthand_resolver` to allow shorthands to be resolved to repositories other than GitHub ([#278](https://github.com/bower/bower/issues/278))

## 0.8.6 - 2013-04-03
- Emergency fix for `node 0.8.x` users to make `zip` extraction work again

## 0.8.5 - 2013-03-04
- Fix `cache-clean` command clearing the completion cache when the command was called with specific packages
- Add error message when an error is caught parsing an invalid `component.json`

## 0.8.4 - 2013-03-01
- Fix some more duplicate async callbacks being called twice
- Preserve new lines when saving `component.json` ([#285](https://github.com/bower/bower/issues/285))

## 0.8.3 - 2013-02-27
- Fix error when using the `update` command ([#282](https://github.com/bower/bower/issues/282))

## 0.8.2 - 2013-02-26
- Fix some errors in windows while removing directories, had to downgrade `rimraf` ([#274](https://github.com/bower/bower/issues/274))
- Prevent duplicate package names in error summaries ([#277](https://github.com/bower/bower/issues/277))

## 0.8.1 - 2013-02-25
- Fix some async callbacks being fired twice ([#274](https://github.com/bower/bower/issues/274))

## 0.8.0 - 2013-02-24
- __Add init command similar to `npm init`__ ([#219](https://github.com/bower/bower/issues/219))
- __Add devDependencies__ support ([#251](https://github.com/bower/bower/issues/251))
- __Add `--save-dev` flag to install/uninstall commands__ ([#258](https://github.com/bower/bower/issues/258))
- `cache-clean` command now clears links pointing to nonexistent folders ([#182](https://github.com/bower/bower/issues/182))
- Fix issue when downloading assets behind a proxy using `https` ([#230](https://github.com/bower/bower/issues/230))
- Fix --save saving unresolved components ([#240](https://github.com/bower/bower/issues/240))
- Fix issue when extracting some zip files ([#225](https://github.com/bower/bower/issues/225))
- Fix automatic conflict resolver not selecting the correct version
- Add `--sources` option to the `list` command ([#235](https://github.com/bower/bower/issues/235))
- Automatically clear cache when git commands fail with code 128 ([#216](https://github.com/bower/bower/issues/216))
- Fix `bower` not working correctly behind a proxy in some commands ([#208](https://github.com/bower/bower/issues/208))

## 0.7.1 - 2013-02-20
- Remove postinstall script from `bower` installation

## 0.7.0 - 2013-02-01
- __Ability to resolve conflicts__ ([#214](https://github.com/bower/bower/issues/214))
- __Ability to search and publish to different endpoints by specifying them in the `.bowerrc` file__
- __Experimental autocompletion__
- __Ability to exclude (ignore) files__
- Fix minor issues in the cache clean command
- Better error message for invalid semver tags ([#185](https://github.com/bower/bower/issues/185))
- Only show discover message in the list command only if there are packages
- Fix mismatch issue due to reading cached component.json files ([#214](https://github.com/bower/bower/issues/214))
- Better error messages when reading invalid .bowerrc files ([#220](https://github.com/bower/bower/issues/220))
- Fix update command when used in packages pointing to assets ([#197](https://github.com/bower/bower/issues/197))
- Bower now obeys packages's `.bowerrc` if they define a different `json` ([#205](https://github.com/bower/bower/issues/205))

## 0.6.8 - 2012-12-14
- Improve list command
  - Does not fetch versions if not necessary (for --map and --paths options)
  - Add --offline option to prevent versions from being fetched
- Fix uninstall command not firing the `end` event
- Fix error when executing an unknown command ([#179](https://github.com/bower/bower/issues/179))
- Fix help for the ls command (alias of list)

## 0.6.7 - 2012-12-10
- Fix uninstall removing all unsaved dependencies ([#178](https://github.com/bower/bower/issues/178))
- Fix uninstall --force flag in some cases
- Add --silent option to the register option, to avoid questioning
- Fix possible issues with options in some commands
- Fix error reporting when reading invalid project component.json

## 0.6.6 - 2012-12-03
- Improve error handling while reading component.json
- Fix package name not being correctly collected in the error summary

## 0.6.5 - 2012-12-01
- Fix error summary not being displayed in some edge cases
- Fix bower not fetching latest commits correctly in some cases

## 0.6.4 - 2012-11-29
- Fix permission on downloaded files ([#160](https://github.com/bower/bower/issues/160))

## 0.6.3 - 2012-11-24
- Fix version not being correctly set for local packages ([#155](https://github.com/bower/bower/issues/155))

## 0.6.2 - 2012-11-23
- Fix uninstall --save when there is no component.json

## 0.6.1 - 2012-11-22
- Fix uninstall when the project component.json has no deps saved ([#153](https://github.com/bower/bower/issues/153))
- Fix uncaught errors when using file writter (they are now caught and reported)
- Fix temporary directories not being deleted when an exception occurs ([#153](https://github.com/bower/bower/issues/140))

## 0.6.0 - 2012-11-21
- __Add link command__ (similar to npm)
- Fix error reporting for nested deps
- Abort if a repository is detected when installing.
  This is useful to prevent people from loosing their work
- Minor fixes and improvements

## 0.5.1 - 2012-11-20
- Add errors summary to the end of install/update commands
- Add windows instructions to the README

## 0.5.0 - 2012-11-19
- __Remove package.json support__
- __Support for local path repositories__ ([#132](https://github.com/bower/bower/issues/132))
- `install --save` now saves the correct tag (e.g: ~0.0.1) instead of 'latest'
- `install --save` now saves packages pointing directly to assets correctly
- Bower automatically creates a component.json when install with `--save` is used
- Fix issues with list command ([#142](https://github.com/bower/bower/issues/142))
- Fix local paths not being saved when installing with --save ([#114](https://github.com/bower/bower/issues/114))
- `uninstall` now uninstalls nested dependencies if they are not shared ([#83](https://github.com/bower/bower/issues/83))
- `uninstall` now warns when a dependency conflict occurs and aborts.
  It will only proceed if the `--force` flag is passed
- Bower now detects mismatches between the version specified in the component.json and the tag, informing the user
- `bower ls` now informs when a package has a new commit (for non-tagged repos)
- Add jshintrc and fix a lot of issues related with JSHint warnings
- `bower register` now prompts if the user really wants to proceed
