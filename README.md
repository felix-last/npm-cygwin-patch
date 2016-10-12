npm on Cygwin
-------------
When running `npm install` with the git binary delivered by cygwin (included in babun), npm [does not properly resolve package dependencies to git repositories](https://github.com/npm/npm/issues/7357). This patch fixes npm's behavior in this case.

How to Install
--------------
After updating npm (`npm install npm@latest -g`), simply run
```bash
cp $APPDATA/npm/node_modules/npm/lib/utils/git.js $APPDATA/npm/node_modules/npm/lib/utils/git.unpatched.js
curl https://raw.githubusercontent.com/felix-last/npm-cygwin-patch/master/lib/utils/git.js > $APPDATA/npm/node_modules/npm/lib/utils/git.js
```
Mind that updating npm requires you to reapply the patch.

Alternatively, copy the file manually:

1. Download the file `/lib/utils/git.js` from this repository.
2. Replace the file `git.js` in `%APP_DATA%\npm\node_modules\npm\lib\utils\` with the downloaded file.

Background
----------
This patch is based on [a pull request to npm](https://github.com/npm/npm/pull/12366) which has not been accepted, as npm does not officially support cygwin.

I changed the way the patch was implemented so that it can be easily rebased on top of new npm versions, making it easy to keep the patch up-to-date. I will try to frequently fetch from the upstream, but please feel free to remind me by opening an issue if this becomes outdated.

Issues?
--------
If this doesn't work for you, maybe [this guide can help you](https://github.com/emigenix/npm_on_cygwin). You can always reset the patched file `git.js` in the folder `%APP_DATA%\npm\node_modules\npm\lib\utils` to the original file realeased by npm - it should be in your folder named `git.unpatched.js`.