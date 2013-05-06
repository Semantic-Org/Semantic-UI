# Include this file into your makefile to bring in the following targets:
#
# - start 						- Start the LiveReload server
# - stop 							- Stops the LiveReload server
# - livereload 				- alias to start
# - livereload-stop 	- aias to stop
#
# Then define your "empty" targets, and the list of files you want to monitor.
#
# 		CSS_DIR = app/styles
# 		CSS_FILES = $(shell find $(CSS_DIR) -name '*.css')
#
# 		$(CSS_DIR): $(CSS_FILES)
#   		@echo CSS files changed: $?
#				@touch $@
#   		curl -X POST http://localhost:35729/changed -d '{ "files": "$?" }'
#
#   	reload-css: livereload $(CSS_DIR)
#
#   	.PHONY: reload-css
#
# The pattern is always the same, define a target for your root directory that
# triggers a POST request and `touch` the directory to update its mtime, a
# reload target with `livereload` target and the list of files to "watch" as
# prerequisites
#
# You can chain multiple "reload" targets in a single one:
#
# 		reload: reload-js reload-css reload-img reload-EVERYTHING

# add tiny-lr to your PATH (only affect the Makefile environment)
PATH := ./node_modules/.bin:$(PATH)

tiny-lr.pid:
	@echo ... Starting server, running in background ...
	@echo ... Run: "make stop" to stop the server ...
	@tiny-lr &

start: tiny-lr.pid

stop:
	@[ -a tiny-lr.pid ] && curl http://localhost:35729/kill
	# Or: @[ -a tiny-lr.pid ] && kill $(shell cat tiny-lr.pid)

livereload: start
livereload-stop: stop


.PHONY: start stop livereload livereload-stop
