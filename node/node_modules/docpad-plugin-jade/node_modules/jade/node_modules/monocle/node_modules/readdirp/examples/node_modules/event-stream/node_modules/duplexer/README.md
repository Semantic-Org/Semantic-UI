# duplexer [![build status][1]][2]

Creates a duplex stream

Taken from [event-stream][3]

## duplex (writeStream, readStream)

Takes a writable stream and a readable stream and makes them appear as a readable writable stream.

It is assumed that the two streams are connected to each other in some way.

## Example

    var grep = cp.exec('grep Stream')

    duplex(grep.stdin, grep.stdout)

## Installation

`npm install duplexer`

## Tests

`make test`

## Contributors

 - Dominictarr
 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/duplexer.png
  [2]: http://travis-ci.org/Raynos/duplexer
  [3]: https://github.com/dominictarr/event-stream#duplex-writestream-readstream