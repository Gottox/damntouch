function DamnEvent(type, target) {
	this.target = target;
	this.type = type;
	this.pageX = 0;
	this.pageY = 0;
	this.clientX = 0;
	this.clientY = 0;
	this.screenX = 0;
	this.screenY = 0;
	this.deltaX = 0;
	this.deltaY = 0;
	this.distance = 0;
	this.distanceX = 0;
	this.distanceY = 0;
	this.timeStamp = 0;
	this.pinchDistance = 0;
	this.scale = 1.0;
	this.scaleDelta = 1.0;
	this.touches = [];
}
DamnEvent.prototype = {
	aggregate: function(ev) {
		if (ev.touches) {
			for (var i = 0; i < ev.touches.length; i++) {
				var touch = new DamnEvent(this.type, ev.touches[i].target)
							.aggregate(ev.touches[i]);
				touch.timeStamp = this.timeStamp;
				this.touches.push(touch);
			}
			this.calcCenter('client');
			this.calcCenter('page');
			this.calcCenter('screen');
			this.calcPinch();
		}
		else {
			this.clientX = ev.clientX;
			this.clientY = ev.clientY;
			this.pageX = ev.pageX;
			this.pageY = ev.pageY;
			this.screenX = ev.screenX;
			this.screenY = ev.screenY;
		}
		this.timeStamp = ev.timeStamp;
		return this;
	},

	calcCenter: function(prefix) {
		if (this.touches.length == 0)
			return;
		var x = prefix + 'X', y = prefix + 'Y';
		this[x] = this[y] = 0;
		for (var i = 0; i < this.touches.length; i++) {
			this[x] += this.touches[i][x];
			this[y] += this.touches[i][y];
		}
		this[x] /= this.touches.length;
		this[y] /= this.touches.length;
	},

	calcPinch: function() {
		if (this.touches.length < 2) {
			this.pinchDistance = 0;
			return;
		}

		var x = this.touches[0].pageX - this.touches[1].pageX;
		var y = this.touches[0].pageY - this.touches[1].pageY;

		this.pinchDistance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	},

	calcPrev: function(prevEv) {
		if (!prevEv)
			return this;
		this.deltaX = this.pageX - prevEv.pageX;
		this.deltaY = this.pageY - prevEv.pageY;
		if (this.pinchDistance && prevEv.pinchDistance)
			this.scaleDelta = this.pinchDistance / prevEv.pinchDistance;
		this.scale = prevEv.scale;
		return this;
	},

	calcFirst: function(firstEv) {
		if (!firstEv)
			return this;
		this.distanceX = firstEv.pageX - this.pageX;
		this.distanceY = firstEv.pageY - this.pageY;
		this.distance = Math.sqrt(Math.pow(this.distanceX, 2) + Math.pow(this.distanceY, 2));
		if (this.pinchDistance && firstEv.pinchDistance)
			this.scale = this.pinchDistance / firstEv.pinchDistance;
		return this;
	}
};

