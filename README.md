# mutable2
A mobx objects library.

## Features
 - Highly performant mobx ES6 classes via decorators
 - Minimum footprint in the class'es structure
 - Compatibility with mobx utils and dev-tools
 - Optionally disable observability completely (for faster SSR)
 - (soon) Reflection API 
 - (soon) Serialization and de-serialization with prototype support 

### Performance
Generally speaking (currently based on few sample tests) classes decorated by mutable will perform at least as good as similar classes decorated by mobx's `observable`, and in some cases much better.  
We're still working on benchmark results from a veriaty of environments and setups.
  
### Compatibility
Mutable classes will produce objects with observable fields, much like Mobx classes.   
Support for development tools and introspection utilities:
 - [mobx `spy`](https://mobx.js.org/refguide/spy.html)
 - mobx `extras` (`getAdministration`, [`isObservable`](https://mobx.js.org/refguide/is-observable.html), `getDebugName`, `getDependencyTree`)
 - mobx-react-devtools is also supported as it uses the supported `extras` features for introspection
 - (soon) [Chrome MobX Developer Tools](https://chrome.google.com/webstore/detail/mobx-developer-tools/pfgnfdagidkfgccljigdamigbcnndkod)
 - (soon) [Chrome mobx-formatters](https://github.com/motion/mobx-formatters)

### Usage code examples
coming soon...

## Developer documentation
how to build and test:
 - clone the repository
 - in the cloned folder, run `npm install`
 - run `npm test` to build and test the code in both nodejs and browser

how to debug (browser):
 - run `npm build:watch` to start transpiling all source files to es5 whenever they change (CTR+c to exit)
 - in a different window, run `npm start` to run a development server that watches the es5 files and serves them to the browser
 - open `http://localhost:8080/webtest.bundle` to run live tests that will update while you change the source code
