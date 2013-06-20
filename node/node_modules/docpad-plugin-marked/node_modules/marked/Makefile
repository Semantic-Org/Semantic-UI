all:
	@cp lib/marked.js marked.js
	@uglifyjs -o marked.min.js marked.js

clean:
	@rm marked.js
	@rm marked.min.js

bench:
	@node test --bench

.PHONY: clean all
