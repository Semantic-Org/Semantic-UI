
test/browser/qs.js: querystring.js
	component build package.json test/browser/qs

querystring.js: lib/head.js lib/querystring.js lib/tail.js
	cat $^ > $@ 

test:
	@./node_modules/.bin/mocha \
		--ui bdd

.PHONY: test