function PinchListener() {
	this.init('pinch');
}
PinchListener.prototype = extend({}, Recognizer.prototype, {
	reset: function() {
	},
	start: function(ev) {
		if(ev.touches && ev.touches.length >= 2)
			return this.itsMe();
	},
	handle: function(ev, finished) {
		this.gesture.setDelegate(new Delegate('onpinch', this, finished));
	},
	end: function(ev) {
		return this.notMe();
	},
	onpinchstart: function() {},
	onpinch: function() {},
	onpinchend: function() {}
});
