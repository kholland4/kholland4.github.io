SRC_HTML = $(shell find src/pages/ -type f -name '*.html')
OUT_HTML  = $(subst src/,,$(SRC_HTML))

FAVICON_SRC = src-favicon.png

pages/%.html: src/pages/%.html
	python3 build-tools/build-page.py -o $@ $<

all: $(OUT_HTML)

clean:
	rm $(OUT_HTML)

favicon: $(FAVICON_SRC)
	python3 build-tools/generate-favicon.py $<

favicon-clean:
	rm $(shell python3 build-tools/generate-favicon.py --list-out-files)

.PHONY: all
