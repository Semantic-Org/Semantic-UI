
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

test:
	@./node_modules/.bin/expresso test/*.test.js

ejs.js: $(SRC)
	@node support/compile.js $^

ejs.min.js: ejs.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du ejs.min.js \
		&& du ejs.js

clean:
	rm -f ejs.js
	rm -f ejs.min.js

.PHONY: test