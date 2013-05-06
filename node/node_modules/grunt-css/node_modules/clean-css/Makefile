TEST_DIR = test
VOWS = ./node_modules/.bin/vows
JSHINT = ./node_modules/.bin/jshint

all: test

test:
	@@echo "Running all tests via vows..."
	@@${VOWS} ${TEST_DIR}/*-test.js

bench:
	@@echo "Running benchmark on big.css file..."
	@@node test/bench.js

check:
	@@echo "Running JSHint on all project files..."
	@@${JSHINT} .

.PHONY: all test bench check