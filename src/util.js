function extend(dest) {
	for (var i = 1; i < arguments.length; i++) {
		for (var k in arguments[i]) {
			if (typeof dest[k] == 'object' && typeof arguments[i][k] == 'object')
				arguments.callee(dest[k], arguments[i][k]);
			else
				dest[k] = arguments[i][k];
		}
	}
	return dest;
}

function claimEvent(ev) {
	ev.stopImmediatePropagation && ev.stopImmediatePropagation();
	ev.preventDefault && ev.preventDefault();
	ev.cancelBubble = true;
	return false;
}
