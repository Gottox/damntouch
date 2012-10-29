SRC= \
	src/util.js \
	src/delegate.js \
	src/event.js \
	src/gesture.js \
	src/recognizer.js \
	src/doubletap.js \
	src/drag.js \
	src/longtap.js \
	src/tap.js

JQUERYSRC = \
	src/bind-jquery.js

VANILLASRC = \
	src/bind-vanilla.js

all: vanilla jquery

damntouch-jquery.js: ${JQUERYSRC} ${SRC} Makefile
	@echo Building $@
	@{ echo '(function(undefined) {'; \
		cat ${SRC} ${JQUERYSRC}; echo '})();'; } > $@

damntouch-vanilla.js: ${VANILLASRC} ${SRC} Makefile
	@echo Building $@
	@{ echo '(function(undefined) {'; \
		cat ${SRC} ${VANILLASRC}; echo '})();'; } > $@

vanilla: damntouch-vanilla.js

jquery: damntouch-jquery.js

clean:
	@echo Cleaning
	@rm -r damntouch-jquery.js damntouch-vanilla.js 2> /dev/null || true;

.PHONY: clean all jquery vanilla
