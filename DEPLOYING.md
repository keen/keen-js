# How to deploy keen.js

## Preparing the release

* Get a cup of coffee and prepare to sit for while.
* Update the `CHANGELOG` with the new features in this release.
Make sure you reference the Pull Request/Issue involved with each feature.
[example](https://github.com/keen/keen-js/blob/431c24b44047adec449184fba0b6a22ca9fdb129/CHANGELOG.md)
* Update the `README` to reflect the latest version
* Add and commit the `CHANGELOG` changes and push to master.
* Run `gulp build` to build out the latest `dist/` files.

## Cutting the Release
* `git add -f dist/` - force add the `dist/` folder
* `git commit -m "v#{version} release"` - commit the last changes
* `git tag v{version}` - Tag the version number
* `git push --tags` - You can also use `git push origin v{version}`.
Tags can be overwritten with an `-f` flag.

## Deploying to NPM

* `npm publish`

## Deploying to AWS:

Run this command with the appropriate aws and aws_secret keys:

`export AWS_KEY={AWS KEY} && export AWS_SECRET={AWS SECRET} && gulp deploy`

This will test, build, and deploy the files to AWS.

This [blog post](https://viget.com/extend/publishing-packages-to-npm-and-bower) was especially helpful with information on
publishing to `npm` and `bower`.

Now that you've finished, uncommit the `dist/` folder.
```ssh
git reset --soft HEAD~1
git rm --cached ./dist
```
