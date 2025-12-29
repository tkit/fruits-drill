.PHONY: build test ts-dev ts-build ts-start ts-lint go-build go-test

# Combined targets
build: ts-build go-build
test: go-test

# TypeScript / Web App targets
ts-dev:
	npm run dev

ts-build:
	npm run build

ts-start:
	npm run start

ts-lint:
	npm run lint

# Go / Tools targets
go-build:
	cd tools && go build -o ../bin/fruits-cli main.go

go-test:
	cd tools && go test ./...
