TESTS = test/*.test.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter spec \
	$(TESTS)

clean:
	rm -f examples/tmp/*

.PHONY: test clean
