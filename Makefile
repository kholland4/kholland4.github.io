SRCS = $(wildcard src/pages/*)
OUT  = $(subst src/,,$(SRCS))

pages/%.html: src/pages/%.html
	python3 build-tools/build-page.py -o $@ $<

all: $(OUT)

clean:
	rm $(OUT)

.PHONY: all
