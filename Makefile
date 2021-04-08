SRC_HTML = $(shell find src/pages/ -type f -name '*.html')
OUT_HTML  = $(subst src/,,$(SRC_HTML))

pages/%.html: src/pages/%.html
	python3 build-tools/build-page.py -o $@ $<

all: $(OUT_HTML)

clean:
	rm $(OUT_HTML)

.PHONY: all
