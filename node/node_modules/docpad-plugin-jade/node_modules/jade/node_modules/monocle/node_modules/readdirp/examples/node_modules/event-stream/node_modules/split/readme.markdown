# Split (matcher)

<img src=https://secure.travis-ci.org/dominictarr/split.png?branch=master>

Break up a stream and reassemble it so that each line is a chunk. matcher may be a `String`, or a `RegExp` 

Example, read every line in a file ...

``` js
  fs.createReadStream(file)
    .pipe(split())
    .on('data', function (line) {
      //each chunk now is a seperate line!
    })

```

`split` takes the same arguments as `string.split` except it defaults to '\n' instead of ',', and the optional `limit` paremeter is ignored.
[String#split](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/split)

