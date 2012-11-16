SRC= \
	src/util.js \
	src/delegate.js \
	src/event.js \
	src/gesture.js \
	src/recognizer.js \
	src/doubletap.js \
	src/drag.js \
	src/longtap.js \
	src/tap.js \
	src/pinch.js \
	src/swipe.js

JQUERYSRC = \
	src/bind-jquery.js

VANILLASRC = \
	src/bind-vanilla.js

all: vanilla jquery

dist/damntouch-jquery.js: ${JQUERYSRC} ${SRC} Makefile
	@echo Building $@
	@mkdir -p dist
	@{ echo '(function(undefined) {'; \
		cat ${SRC} ${JQUERYSRC}; echo '})();'; } > $@

dist/damntouch-vanilla.js: ${VANILLASRC} ${SRC} Makefile
	@echo Building $@
	@mkdir -p dist
	@{ echo '(function(undefined) {'; \
		cat ${SRC} ${VANILLASRC}; echo '})();'; } > $@

vanilla: dist/damntouch-vanilla.js

jquery: dist/damntouch-jquery.js

clean:
	@echo Cleaning
	@rm -r damntouch-jquery.js damntouch-vanilla.js 2> /dev/null || true;

.PHONY: clean all jquery vanilla
