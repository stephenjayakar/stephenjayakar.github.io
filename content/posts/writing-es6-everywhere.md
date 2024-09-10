+++
title = 'Writing ES6 Everywhere'
date = 2019-09-28T12:55:44-07:00
draft = true
tags = ['tech']
+++

_Originally posted on the [Mobile Developers of Berkeley blog](https://mdb.dev/misc-content/writing-es6-everywhere/)_

This article is going to be a quick intro to the basics of writing modern JavaScript all the time, rather than being dependent on what environment is supported by a given browser.

## Intro

First, what is ES6?  **E**CMA**S**cript 6 is the sixth standardized version of JavaScript, which is ultimately a specification of language features.  ES6 added a ton of really great features that drastically improved the ability to construct larger-scale programs with JavaScript (like constants and block scoping!).  It’s important to note, as ES6 is only a specification, it’s ultimately up to the browsers to provide an implementation for these new features: often, certain browsers lag behind on implementing all these features (i.e. IE).

So that kind of sucks!  If that was the end of the story, programmers would essentially have to use the newest version that was supported by all “modern” browsers.  However, there’s a process called **transpiling**, which is like compiling, but goes from code source → code source rather than to an executable.  Luckily, there’s a really great project called [Babel](https://babeljs.io/), which is often used to convert from newer versions of ES → a version supported by most browsers.  So from a higher level, the programmer writes code in ES6 / what they’re familiar with, the transpiler converts it to some older version of JS that runs everywhere, and then it’s added to the payload for a website / some type of node app.

Before we dive into how to set up the workflow, install npm (node package manager) and node as CLI dependencies (you can figure this out 😛)

Let’s dive into how to set up this workflow…First, create a new directory and initialize with npm:

```sh
mkdir es6-everywhere
cd es6-everywhere
npm init
# press enter a ton to initialize a default package.json
mkdir src
touch src/index.js
```

Now we have our project set up, and have an entry point where we can write JS code (“src/index.js”).  So we already have a basic setup where we can actually run any normal JS that’s supported by our version of node.  If you want to try this yourself, try editing “index.js” to this:

```js
var x = 2;
console.log(x ** 2);
```

and then run this shell command: `node src/index.js`.

You should see 4 logged to STDOUT!  However, this isn’t really that exciting as this is normal JS running within NodeJS.  Let’s first start by creating an npm script that executes this script using node.  Begin by adding this line to package.json under “scripts”; you should already see an entry for the example script “test”:

```json
"scripts": {
    ...
    "execute": "node src/index.js"
```

---

## ES6 vs. Vanilla

Ok!  We’ve now kind of gotten the basic flow of executing scripts with npm. However, here’s a code snippet that *may or may not work* depending on your version of Node (and probably won’t work on IE 8 😛).

```js
const square = x => x * x;
let value = 11;
console.log(value);
value = square(value);
console.log(value);
```

If I run `npm execute`, I actually end up getting the correct values printed out to STDOUT.  However, I also have node version 12.9.0, and the whole point of this article is to write JS that’s mostly independent of what version we’re using.  Also, let’s take a look at the snippet and the “new” features that it’s using by looking at some of the code.

```js
const square = x => x * x
```

There are a couple of things going on here.  First, the `const` keyword is new!  It indicates that a given variable is deemed constant, and its value cannot be changed.  However, in the case that it’s pointing to an object (like a list), that object can change, but the pointer to it cannot.  In general, it’s good practice to use either `const` or `let`  instead of `var` in ES6; this is first because of the fact that we’re specifying in the variable should be mutable or not.  Also, both of these variable declarations are block-scoped rather than function-scoped (which is in-line with how some other languages handle variable scoping and a lot clearer).  Here’s an example of something that works in normal JS but doesn’t work with `const` + `let` for good reason:

```js
{
  var x = 2;
}
console.log(x)
```

versus

```js
{
  const x = 2;
}
console.log(x)
```

You can try executing both of these, but basically, for the second snippet, the second example should fail.  This allows for much cleaner namespacing and decreases clutter (+ makes it clear when we’re shadowing variable names in places like the block in a conditional statement).

Now, let’s look at the right side of this line (and one of my favorite ES6 features!): `x => x * x`.  In ES6 terminology, we refer to this as an **arrow-function**.  The two main advantages of using an arrow function are **conciseness** and **`this` being lexically bound**, with the possible drawback of being anonymous (no name!).  The latter advantage is a bit harder to explain and is better appreciated when speaking of ES6 classes, but the first point is dope.  If you’re familiar with Python, this statement is equivalent to `lambda x: x * x`, which is a simple square function.

---

## Packaging it up

Alright, let’s get back to our objective: we’re trying to convert this to older JS for compatibility reasons!  We’re going to have to add some packages, but don’t worry I’ll walk you through what each one does!  Run this command in the “es6-everywhere” folder:

```
npm add @babel/core @babel/preset-env babel-loader webpack webpack-cli --save-dev
```

Let’s talk first about babel.  Babel is a type of JavaScript compiler that actually compiles between JavaScript versions (also known as a **transpiler**, or a [**source-to-source compiler**](https://en.wikipedia.org/wiki/Source-to-source_compiler), as we talked about earlier).  It’s pretty much exactly what we’re looking for 🙂. Webpack is a really powerful plugin that is used primarily for bundling together tons of assets (like images, JS files, CSS files) into one website with usually one big JS file imported into one HTML file with the assets baked in.  We’re going to be using webpack in order to get Babel to run on our code, as that flow will be more similar to how things would be done in production.

When adding new plugins, we’re going to have to configure them.  First, let’s start with Babel’s options.  Create a new file in “es6-everywhere” called “.babelrc”, and put this in it:

```json
{
  "presets": ["@babel/preset-env"]
}
```

This tells babel the mode to run in, which accepts ES6 as a language input and has a default output that’s generally supported across the board.  We can actually further configure the output, but we’re not going to be going into that; if you’re interested, check out the docs on [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env).

Webpack is a bit more complicated.  Create a file called “webpack.config.js” and put this in it:

```js
const webpack = require('webpack');
const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    devtoolModuleFilenameTemplate        : '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ],
  },
  target: "node"
}
```

From a higher level perspective, this tells webpack a couple of things.  First, our entry point (the highest level of code) is put in “src/index.js”.  Also, we’re going to be outputting to “dist/index.js”.  The other interesting thing is that we’re ignoring files inside of the “node_modules” folder; if we didn’t do this, webpack would end up compiling all of the files of the plugins that we add with babel!  While we do want the code bundled in in some cases, running the transpiler on it is not what we’re trying to do.  Lastly, we indicate that we should be using babel on the files that we’re considering by using the “babel-loader”.

This should be all the config we need!  Let’s add another npm script to “package.json” in order to actually test our config.  Add this under the “scripts” section:

```json
"yeet": "webpack --mode development && cat dist/index.js"
```

This script runs webpack on the file that we specified in the config, and then prints out the output file “dist/index.js” to shell.  If you now run npm run yeet | tail you should see an output something like this:

```sh
npm run yeet | tail
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var square = function square(x) {\n  return x * x;\n};\n\nvar value = 11;\nconsole.log(value);\nvalue = square(value);\nconsole.log(value);\n\n//# sourceURL=Users/ajay/programming/es6-everywhere/src/index.js");

/***/ })

/******/ });
```

We’re done!  As you can see, the code has been transformed into something different (for example, our `const` keywords have been replaced with `var` keywords, and our arrow function was remade into a normal JS function).  If you want to actually run the code, you can modify the yeet script to run `node dist/index.js` instead of printing it to the terminal, but I’ll leave you to figure that out on your own.

Have fun writing ES6 everywhere!
