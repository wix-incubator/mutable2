# mutable2
A mobx objects library.


### usage code examples
coming soon...

## developer documentation
how to build and test:
 - clone the repository
 - in the cloned folder, run `npm install`
 - run `npm test` to build and test the code in both nodejs and browser

how to debug (browser):
 - run `npm build:watch` to start transpiling all source files to es5 whenever they change (CTR+c to exit)
 - in a different window, run `npm start` to run a development server that watches the es5 files and serves them to the browser
 - open `http://localhost:8080/webtest.bundle` to run live tests that will update while you change the source code
