function DoubletapListener() {
	this.init('doubletap');
}
DoubletapListener.prototype = extend({}, Recognizer.prototype, {
	reset: function() {
		this.ended = false;
		this.clicks = 0;
	},
	start: function(ev) {
		var self = this;
		if (ev.touches.length > 1)
			return this.notMe();
		else if (this.clicks == 0) {
			this.timeout = setTimeout(function() {
				return self.notMe();
			}, this.gesture.options.doubletapTimeout);
		}
		else
			return this.itsMe();
		this.clicks++;
	},
	move: function(ev) {
		if (ev.touches.length > 1 || ev.distance > this.gesture.options.threshold)
			return this.notMe();
	},
	handle: function(ev, finished) {
		this.ondoubletap(ev);
		finished();
	},
	ondoubletap: function() {}
});
