SparkMD5
========================

SparkMD5 is a fast md5 implementation of the MD5 algorithm.
This script is based in the JKM md5 library which is the
fastest algorithm around (see: http://jsperf.com/md5-shootout/7).

NOTE: Please disable Firebug while performing the test!
      Firebug consumes a lot of memory and CPU and slows the test by a great margin.

Improvements over the JKM md5 library:

 * Functionality wrapped in a closure
 * Object oriented library
 * Incremental md5 (see bellow)
 * CommonJS (it can be used in node) and AMD integration
 * Validates using jshint


Incremental md5 performs a lot better for hashing large ammounts of data, such as
files. One could read files in chunks, using the FileReader & Blob's, and append
each chunk for md5 hashing while keeping memory usage low. See example bellow.

Normal usage:
========================

    var hexHash = SparkMD5.hash('Hi there');       // hex hash
    var rawHash = SparkMD5.hash('Hi there', true); // OR raw hash

Incremental usage:
========================

    var spark = new SparkMD5();
    spark.append('Hi');
    spark.append(' there');
    var hexHash = spark.end();                    // hex hash
    var rawHash = spark.end(true);                // OR raw hash

Hash a file incrementally:
========================

    NOTE: If you test the code bellow using the file:// protocol in chrome you must start the browser with -allow-file-access-from-files argument.
          Please see: http://code.google.com/p/chromium/issues/detail?id=60889

    document.getElementById("file").addEventListener("change", function() {

        var fileReader = new FileReader(),
            blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            file = document.getElementById("file").files[0],
            chunkSize = 2097152,                           // read in chunks of 2MB
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5();

        fileReader.onload = function(e) {
            console.log("read chunk nr", currentChunk + 1, "of", chunks);
            spark.appendBinary(e.target.result);           // append binary string
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            }
            else {
               console.log("finished loading");
               console.info("computed hash", spark.end()); // compute hash
            }
        };

        function loadNext() {
            var start = currentChunk * chunkSize,
                end = start + chunkSize >= file.size ? file.size : start + chunkSize;

            fileReader.readAsBinaryString(blobSlice.call(file, start, end));
        };

        loadNext();
    });

TODOs:
========================
 * Add native support for reading files? Maybe add it as an extension?

Credits:
========================

Joseph Myers (http://www.myersdaily.org/joseph/javascript/md5-text.html)
