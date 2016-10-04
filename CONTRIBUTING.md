# Keen IO JavaScript Client

First off, thank you for considering contributing to this official Keen IO client. It's people like you that make Keen IO such a great tool.

We put these guidelines together to try and make working with our SDK as straight forward as possible, and hopefully help you understand how we communicate about potential changes and improvements.

Improving documentation, bug triaging, building modules for various frameworks or writing tutorials are all examples of helpful contributions we really appreciate.

Please, don't use the issue tracker for support questions. If you have a support question please come hang out in http://keen.chat or send an email to team@keen.io

## Guidelines

* Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback.
* Be welcoming to newcomers and encourage diverse new contributors from all backgrounds. 
* Please take time to read our [Community Code of Conduct](#community-code-of-conduct) which includes Reporting Guidelines.

## Community Code of Conduct 

The Keen IO Community is dedicated to providing a safe, inclusive, welcoming, and harassment-free space and experience for all community participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers. Our Code of Conduct exists because of that dedication, and we do not tolerate harassment in any form. See our reporting guidelines [here](https://github.com/keen/community-code-of-conduct/blob/master/incident-reporting.md). Our full Code of Conduct can be found at this [link](https://github.com/keen/community-code-of-conduct/blob/master/long-form-code-of-conduct.md). 

## Your First Contribution

Here are a couple of friendly tutorials with more information about contributing to OSS projects: http://makeapullrequest.com/,  http://www.firsttimersonly.com/, and [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first :smile_cat:

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

### Run the following commands to get this project set up locally.

```ssh
$ git clone https://github.com/keenlabs/keen-js.git && cd keen-js
$ npm install
$ bower install

# Build and launch project site
$ gulp

# Build and launch with tests
$ gulp with-tests

# View test results at http://localhost:9999
```

### Submitting a Pull Request

Use the template below. If certain testing steps are not relevant, specify that in the PR. If additional checks are needed, add 'em! Please run through all testing steps before asking for a review.

```
## What does this PR do? How does it affect users?

## How should this be tested?

Step through the code line by line. Things to keep in mind as you review:
 - Are there any edge cases not covered by this code?
 - Does this code follow conventions (naming, formatting, modularization, etc) where applicable?

Fetch the branch and/or deploy to staging to test the following:

- [ ] Does the code compile without warnings (check shell, console)?
- [ ] Do all tests pass?
- [ ] Does the UI, pixel by pixel, look exactly as expected (check various screen sizes, including mobile)?
- [ ] If the feature makes requests from the browser, inspect them in the Web Inspector. Do they look as expected (parameters, headers, etc)?
- [ ] If the feature sends data to Keen, is the data visible in the project if you run an extraction (include link to collection/query)?
- [ ] If the feature saves data to a database, can you confirm the data is indeed created in the database?

## Related tickets?
```

## How to report a bug
If you find a security vulnerability, do NOT open an issue. Email team@keen.io instead.

If you find a bug that's not a security vulnerability please head over to the issues tab of this rep and open up an issue.

We created these labels to help us organize issues: bugs, docs, enhancements, and feature-request. Please use them when creating an issue where it makes sense!

## Suggesting features

We welcome your feedback and requests. If you have a straight forward request please open up an issue that details the request. If you want to talk to someone on the Keen team head over to http://keen.chat or send a note to team@keen.io and we will make sure and get you in touch with the product team.

# Code review process

The core team looks at Pull Requests and issues on a regular basis and will typically respond within 5 business days.
