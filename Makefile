build: components index.js package.json
	@npm install
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

test:
	@./node_modules/.bin/mocha

.PHONY: clean test build node_modules
