function Recognizer(type) {
	this.type = type;
	this.timeout = null;
}
Recognizer.prototype = {
	init: Recognizer.prototype.constructor,

	start: function() {},
	move: function() {},
	end: function() {},
	givedUp: function() {},
	itsMe: function() {
		this.gesture.recognized(this.type, true);
	},
	notMe: function() {
		this.gesture.recognized(this.type, false);
	},
	_reset: function() {
		if (this.timeout !== null)
			clearTimeout(this.timeout);
		this.timeout = null;
		if (this.reset)
			this.reset();
	}
};
