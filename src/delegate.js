function Delegate(eventPrefix, receiver, finished) {
	this.receiver = receiver;
	this.eventPrefix = eventPrefix;
	this.finished = finished;
}
Delegate.prototype = {
	start: function(ev) {
		this.receiver[this.eventPrefix + ev.type](ev);
	},

	move: function(ev) {
		this.receiver[this.eventPrefix](ev);
	},

	end: function(ev) {
		this.receiver[this.eventPrefix + ev.type](ev);
		this.finished();
	}
};
