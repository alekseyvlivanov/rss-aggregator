install:
	npm install

develop:
	npx vite

build:
	npx vite build --emptyOutDir

preview:
	npx vite preview

lint:
	npx eslint .

test:
	npm test

.PHONY: test
