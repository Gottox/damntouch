function DragListener() {
	this.init('drag');
}
DragListener.prototype = extend({}, Recognizer.prototype, {
	reset: function() {
		this.blocked = false;
	},
	start: function() {
	},
	move: function(ev) {
		if (ev.distance > this.gesture.options.threshold) {
			this.blocked = true;
			this.givedUp();
		}
	},
	end: function() {
		return this.notMe();
	},
	givedUp: function() {
		if (this.blocked
				&& 'swipeH' in this.gesture.recognizers === false
				&& 'swipeV' in this.gesture.recognizers === false)
			return this.itsMe();
	},
	handle: function(ev, finished) {
		this.gesture.delegate = new Delegate('ondrag', this, finished);
	},
	ondragstart: function() {},
	ondrag: function() {},
	ondragend: function() {}
});
