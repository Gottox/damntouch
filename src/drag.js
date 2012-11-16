var DRAG_BLOCKER = ['swipe:left', 'swipe:right', 'swipe:up', 'swipe:down'];
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
		var blocker = false;
		for(var i = 0; i < DRAG_BLOCKER.length && !blocker; i++)
			blocker = !!this.gesture.recognizers[DRAG_BLOCKER[i]];
			
		if (this.blocked && !blocker)
			return this.itsMe();
	},
	handle: function(ev, finished) {
		this.gesture.delegate = new Delegate('ondrag', this, finished);
	},
	ondragstart: function() {},
	ondrag: function() {},
	ondragend: function() {}
});
