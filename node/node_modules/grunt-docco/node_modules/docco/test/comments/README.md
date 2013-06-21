## Docco Comment Parser Test Data

This directory contains test data files to verify that single-line 
comments are parsed as expected.  Each source file contains code
and comments in the language it is testing, with the first comment 
being an integer value that is the number of expected comments in the file.

### Results as a custom CSV template

The file `comments.jst` in this directory is used when running docco over
the example source files, and it breaks the doc blocks into a CSV list
of doc texts.  This CSV list is loaded by the comments parser test, and
used to validate the expected output.
