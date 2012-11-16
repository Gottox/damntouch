var SWIPE_DIRECTIONS = {
	left: [1, 0],
	right: [-1, 0],
	up: [0, 1],
	down: [0, -1]
}

function SwipeListener(direction) {
	this.direction = SWIPE_DIRECTIONS[direction];
	if(!this.direction)
		throw "unkown direction";
	this.init('swipe:'+direction);
}
SwipeListener.prototype = extend({}, Recognizer.prototype, {
	reset: function() {
		this.considering = false;
	},
	start: function(ev) {
		this.startEv = ev;
	},
	move: function(ev) {
		var dist = [ ev.distanceX, ev.distanceY ];
		if(this.considering) {
			for(var i = 0, o = 1; i < 2; i++, o--) {
				if(dist[i]*this.direction[i] < 0) {
					this.onswipecancel();
					this.considering = false;
				}
			}
		}
		else if (ev.distance > this.gesture.options.threshold) {
			for(var i = 0, o = 1; i < 2; i++, o--) {
				if(dist[i]*this.direction[i] > Math.abs(dist[o]))
					this.considering = true;
			}
			if(this.considering) {
				this.onswipestart(this.startEv);
				this.onswipe(ev);
			}
			else
				this.notMe();
		}
	},
	end: function(ev) {
		if(this.considering) {
			this.onswipeend(ev);
			return this.itsMe();
		}
		else
			return this.notMe();
	},
	givedUp: function() {
	},
	handle: function(ev, finished) {
	},
	onswipestart: function() {console.log('start')},
	onswipe: function() {console.log('swipe')},
	onswipeend: function() {console.log('end')},
	onswipecancel: function() {console.log('cancel')}
});
