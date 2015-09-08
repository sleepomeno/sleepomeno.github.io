% PureScript
% Gregor Riegler
% Lambdaheads Vienna  --  May 13, 2015

# PureScript

* Compiles to JavaScript
    + to use in your browser
    + to use on Node.js

. . . 

$\Rightarrow$ _write Web Applications!_

# PureScript

* Statically typed and similar to *Haskell*

* Another language to target JavaScript as
    + TypeScript
    + Dart
    + CoffeeScript
    + ... and others

# PureScript Motivation

> Solutions at the time included various attempts to compile Haskell to JavaScript while preserving its semantics (Fay, Haste, GHCJS), but I was interested to see how successful I could be by approaching the problem from the other side - attempting to keep the semantics of JavaScript, while enjoying the syntax and type system of a language like Haskell.
-- [Phil Freeman](https://leanpub.com/purescript/read)

# PureScript ?= Haskell

> In the case of purescript, it really does seem to be turning into a gateway drug to get folks into the Haskell community, much the way Scala used to be (and still is to a lesser extent), but closer in spirit.

[edwardkmett, 04/30/2015](http://www.reddit.com/r/haskell/comments/342rvp/google_summer_of_code_18_projects_accepted/)

# PureScript /= Haskell

* Strict evaluation $\rightarrow$ no "lazyness"
* Fine-grained "IO" monad called the ["Eff" monad](https://github.com/purescript/purescript/wiki/Handling-Native-Effects-with-the-Eff-Monad) 
* Literal syntax for arrays instead of lists
* "Row types" - Records similar to JavaScript records
* Foreign Function Interface for JavaScript interoperation
* ... and some others [in the wiki](https://github.com/purescript/purescript/wiki/Differences-from-Haskell)

# Try PureScript

[TryPureScript.org](http://try.purescript.org/)

# Install tools

* *psc* - PureScript compiler
    + cabal install purescript
* *npm* - [Node Package Manager](https://nodejs.org/)
* *grunt*
    + Build Automation Tool
    + npm install -g grunt-cli 
* *bower* - for PureScript dependencies
    + npm install -g bower

# Useful resources

* [Pursuit](http://pursuit.purescript.org/)
    + Search types like Hoogle

* [Bower Search](http://bower.io/search/)
    + Searching with prefix "purescript-" finds libraries
    + from the command-line: "bower search purescript"

* [Wiki Page Recommended Libraries](https://github.com/purescript/purescript/wiki/Recommended-Libraries)


# Live Demo

![](ps_logo.png)

# Learn PureScript 1

## Best Learning Resource

* [PureScript By Example](https://leanpub.com/purescript/read)
     + can be read online, free donations
     + a very thorough and yet exciting read!
     + written by the PureScript creator Phil Freeman

# Learn PureScript 2

## Other Resources

* [PureScript Wiki](https://github.com/purescript/purescript/wiki)
* [24 days of PureScript](https://gist.github.com/paf31/8e9177b20ee920480fbc)
* [TryPureScript.org](http://try.purescript.org/)
* [#purescript IRC Freenode]()

# PureScript rocks?!

![Thanks for your attention!](ps_logo.png)
