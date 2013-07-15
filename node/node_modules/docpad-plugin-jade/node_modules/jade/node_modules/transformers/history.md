## 2.0.1 - 2013-04-22

 - Fix global leak of `exportscoffeeScript` (test still fails because `jade` requires an out of date version of `transformers`)

## 2.0.0 - 2013-03-31

 - Add `minify` support to all transformers
 - Bundle minifiers in package

## 1.8.3 - 2013-03-19

 - Update promise dependency

## 1.8.2 - 2013-02-10

 - Support `sourceURLs` in **component**

## 1.8.1 - 2013-02-10

 - Add travis-ci
 - FIX **toffee** support which was broken by their latest update
 - FIX lookup paths for **component** weren't set so you couldn't build components with dependancies

## 1.8.0 - 2013-01-30

 - **highlight** (needs tests)

## 1.7.0 - 2013-01-30

 - **component-js**
 - **component-css**
 - **html2jade** - must be `v0.0.7` because of a bug in later versions
 - Much more extensive tests

## 1.6.0 - 2013-01-29

 - **uglify-css**
 - **uglify-json**
 - Rename **uglify** to **uglify-js**

## 1.5.0 - 2013-01-27

 - **dot**

## 1.4.0 - 2013-01-25

 - Support sync `@import` statements in **less**
 - Report real errors from **less** (rather than objects)

## 1.3.0 - 2013-01-25

 - **templayed**
 - **plates**

## 1.2.1 - 2013-01-09

 - make **markdown** work when using **markdown** as the engine (**marked** is the recommended engine).

## 1.2.0 - 2013-01-09

 - **js** (pass through)
 - **css** (pass through)
 - rename **coffee-script** from **coffee** to **coffee-script** and add **coffee** as an alias

## 1.1.0 - 2013-01-08

 - **coffeecup**
 - **cson**
 - FIX: disabling **dust** cache