test: node_modules
	./node_modules/.bin/mocha -R spec -t 10000

node_modules: package.json
	npm install

.PHONY: test
