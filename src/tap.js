function TapListener() {
	this.init('tap');
}
TapListener.prototype = extend({}, Recognizer.prototype, {
	reset: function() {
		this.ended = false;
		this.clicks = 0;
	},
	start: function(ev) {
		this.clicks++;
		if (ev.touches.length > 1)
			return this.notMe();
	},
	move: function(ev) {
		if (ev.distance > this.gesture.options.threshold) {
			return this.notMe();
		}
	},
	end: function() {
		this.ended = true;
		if ('doubletap' in this.gesture.recognizers === false)
			return this.itsMe();
	},
	givedUp: function() {
		if (this.ended)
			this.end();
	},
	handle: function(ev, finished) {
		while (this.clicks--)
			this.ontap(ev);
		finished();
	},
	ontap: function() {}
});
