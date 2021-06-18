SRC_HTML = $(shell find src/pages/ -type f -name '*.html')
OUT_HTML  = $(subst src/,,$(SRC_HTML))

BUILD_PAGE_SCRIPTS = build-tools-py/build-page.py $(wildcard build-tools-py/template_*.py)
BASEURL = "https://www.tausquared.net/"

FAVICON_SRC = src-favicon.png

pages/%.html: src/pages/%.html $(BUILD_PAGE_SCRIPTS)
	python3 build-tools-py/build-page.py -o $@ --baseurl $(BASEURL) $<

all: $(OUT_HTML) tidy spell

tidy: .tidy_ok

.tidy_ok: $(SRC_HTML) $(OUT_HTML)
	tidy -qe --gnu-emacs yes $^
	touch .tidy_ok

spell: .spell_ok

.spell_ok: $(SRC_HTML)
	bash ./spellcheck.sh $^
	touch .spell_ok

clean:
	rm $(OUT_HTML) .tidy_ok .spell_ok

favicon: $(FAVICON_SRC) build-tools-py/generate-favicon.py
	python3 build-tools-py/generate-favicon.py $<

favicon-clean:
	rm $(shell python3 build-tools-py/generate-favicon.py --list-out-files)

.PHONY: all
