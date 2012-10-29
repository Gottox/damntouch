SRC= \
	src/delegate.js \
	src/doubletap.js \
	src/drag.js \
	src/event.js \
	src/gesture.js \
	src/longtap.js \
	src/recognizer.js \
	src/tap.js \
	src/util.js

JQUERYSRC = \
	src/bind-jquery.js

VANILLASRC = \
	src/bind-vanilla.js

all: vanilla jquery

damntouch-jquery.js: ${JQUERYSRC} ${SRC}
	@echo Building $@
	@{ echo '(function(undefined) {'; \
		cat ${SRC} ${JQUERYSRC}; echo '})();'; } > $@

damntouch-vanilla.js: ${VANILLASRC} ${SRC}
	@echo Building $@
	@{ echo '(function(undefined) {'; \
		cat ${SRC} ${VANILLASRC}; echo '})();'; } > $@

vanilla: damntouch-vanilla.js

jquery: damntouch-jquery.js

clean:
	@echo Cleaning
	@rm -r damntouch-jquery.js damntouch-vanilla.js 2> /dev/null || true;

.PHONY: clean all jquery vanilla
