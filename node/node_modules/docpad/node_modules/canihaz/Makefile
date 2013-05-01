ALL_TESTS = $(shell find test/ -name '*.test.js')
NPM_TARBALL = $(shell npm pack)

test:
	# Install the module as node_module, so it can parse our package.json for
	# details.
	@npm install $(NPM_TARBALL) > /dev/null 2>&1
	@rm $(NPM_TARBALL) > /dev/null 2>&1
	@./node_modules/.bin/mocha $(ALL_TESTS)
	@rm -rf ./node_modules > /dev/null 2>&1
	@npm install . > /dev/null 2>&1

.PHONY: test
