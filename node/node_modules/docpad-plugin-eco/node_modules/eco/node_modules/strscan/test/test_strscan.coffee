{StringScanner} = require "../src/strscan"

s = new StringScanner "Fri Dec 12 1975 14:39"
s.scan /Fri /
s.concat " +1000 GMT"
ok s.getSource() is "Fri Dec 12 1975 14:39 +1000 GMT"
ok s.scan(/Dec/) is "Dec"

s.reset()
ok s.getPosition() is 0
ok not s.getPreMatch()
ok not s.getMatch()
ok not s.getPostMatch()
ok s.getRemainder() is s.getSource()
ok s.scan(/Fri /)

s = new StringScanner "Fri Dec 12 1975 14:39"
ok s.scan(/(\w+) (\w+) (\d+) /) is "Fri Dec 12 "
ok s.getMatch() is "Fri Dec 12 "
ok s.getCapture(0) is "Fri"
ok s.getCapture(1) is "Dec"
ok s.getCapture(2) is "12"
ok s.getPostMatch() is "1975 14:39"
ok s.getPreMatch() is ""

s = new StringScanner "test string"
ok not s.hasTerminated()
s.scan /test/
ok not s.hasTerminated()
s.terminate()
ok s.hasTerminated()

ok s.getPosition() is 11
s.concat "123"
ok not s.hasTerminated()
ok s.getRemainder() is "123"
ok s.scan /123/
ok s.getPosition() is 14

s = new StringScanner "ab"
ok s.scanChar() is "a"
ok s.scanChar() is "b"
ok not s.scanChar()

s = new StringScanner "☃\n1"
ok s.scanChar() is "☃"
ok s.scanChar() is "\n"
ok s.scanChar() is "1"
ok not s.scanChar()

s = new StringScanner "test string"
ok s.peek(7) is "test st"
ok s.peek(7) is "test st"

s = new StringScanner "test string"
ok s.scan(/\w+/) is "test"
ok not s.scan(/\w+/)
ok s.scan(/\s+/) is " "
ok s.scan(/\w+/) is "string"
ok not s.scan(/\w+/)

s = new StringScanner "test string"
ok s.scan(/\w+/) is "test"
ok s.scan(/\s+/) is " "
ok s.getPreMatch() is "test"
ok s.getPostMatch() is "string"

s = new StringScanner "Fri Dec 12 1975 14:39"
ok s.scanUntil(/1/) is "Fri Dec 1"
ok s.getPreMatch() is "Fri Dec "
ok not s.scanUntil(/XYZ/)

s = new StringScanner "abaabaaab"
ok s.scanUntil(/b/) is "ab"
ok s.scanUntil(/b/) is "aab"
ok s.scanUntil(/b/) is "aaab"

s = new StringScanner "test string"
ok s.skip(/\w+/) is 4
ok not s.skip(/\w+/)
ok s.skip(/\s+/) is 1
ok s.skip(/\w+/) is 6
ok not s.skip(/./)

s = new StringScanner "Fri Dec 12 1975 14:39"
ok s.skipUntil(/12/) is 10
ok s.peek() is " "
ok s.peek(3) is " 19"

s = new StringScanner "test string"
ok s.scan(/\w+/) is "test"
s.unscan()
ok s.scan(/../) is "te"
ok not s.scan(/\d/)

raised = true
try
  s.unscan()
  raised = false
catch e
ok raised

s = new StringScanner "Fri Dec 12 1975 14:39"
ok s.check(/Fri/) is "Fri"
ok s.getPosition() is 0
ok s.getMatch() is "Fri"
ok not s.check(/12/)
ok not s.getMatch()

s = new StringScanner "Fri Dec 12 1975 14:39"
ok s.checkUntil(/12/) is "Fri Dec 12"
ok s.getPosition() is 0
ok s.getMatch() is "12"
