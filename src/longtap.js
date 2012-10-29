function LongtapListener() {
	this.init('longtap');
}
LongtapListener.prototype = extend({}, Recognizer.prototype, {
	reset: function() {
	},
	start: function() {
		var self = this;
		this.timeout = setTimeout(function() {
			self.itsMe();
		}, this.gesture.options.longtapTimeout);
	},
	move: function(ev) {
		if (ev.distance > this.gesture.options.threshold)
			return this.notMe();
	},
	end: function() {
		return this.notMe();
	},
	handle: function(ev, finished) {
		this.onlongtap(ev);
		finished();
	},
	onlongtap: function() {}
});
