// This is a test fixture for a case where spawn receives incomplete
// multibyte strings in separate data events.

// A multibyte buffer containing all our output. We will slice it later.
// In this case we are using a Japanese word for hello / good day, where each
// character takes three bytes.
var fullOutput = new Buffer('こんにちは');

// Output one full character and one third of a character
process.stdout.write(fullOutput.slice(0, 4));

// Output the rest of the string
process.stdout.write(fullOutput.slice(4));

// Do the same for stderr
process.stderr.write(fullOutput.slice(0, 4));
process.stderr.write(fullOutput.slice(4));
