# Makefile for dataurl

all: build
.PHONY: all

build:
	@cargo build --locked
.PHONY: build

test: build
	@cargo test --locked
	@cargo fmt --all -- --check
.PHONY: test

lint:
	@cargo fmt --all --
.PHONY: lint

install:
	@cargo install --force --locked --path .
	@cargo install --force --locked --path . --root .
.PHONY: install

uninstall:
	@cargo uninstall
.PHONY: uninstall

clean:
	@cargo clean
.PHONY: clean
