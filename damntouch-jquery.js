(function(undefined) {
function extend(dest) {
	for (var i = 1; i < arguments.length; i++) {
		for (var k in arguments[i]) {
			if (typeof dest[k] == 'object' && typeof arguments[i][k] == 'object')
				arguments.callee(dest[k], arguments[i][k]);
			else
				dest[k] = arguments[i][k];
		}
	}
	return dest;
}

function claimEvent(ev) {
	ev.stopImmediatePropagation && ev.stopImmediatePropagation();
	ev.preventDefault && ev.preventDefault();
	ev.cancelBubble = true;
	return false;
}

function bind(fn, t) {
	var args = Array.prototype.slice.call(arguments, 2);
	return function() {
		var a = args.slice();
		a.push.apply(a, arguments);
		return fn.apply(t, a);
	};
}
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
function DamnEvent(type, target) {
	this.target = target;
	this.type = type;
	this.pageX = 0;
	this.pageY = 0;
	this.clientX = 0;
	this.clientY = 0;
	this.screenX = 0;
	this.screenY = 0;
	this.distance = 0;
	this.distanceX = 0;
	this.distanceY = 0;
	this.timeStamp = 0;
	this.pinchDistance = 0;
	this.scale = 1.0;
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
		if(this.type === 'start')
			this.calcTargetCoord();
		this.timeStamp = ev.timeStamp;
		return this;
	},

	calcTargetCoord: function() {
		var e = this.target;
		var coord = {x:0, y:0};
		var scrolloffset = {x:document.body.scrollLeft, y:document.body.scrollTop};
		do {
			coord.x+=e.offsetLeft;
			coord.y+=e.offsetTop;
		} while(e = e.offsetParent)
		this.targetX = this.clientX + scrolloffset.x - coord.x;
		this.targetY = this.clientY + scrolloffset.y - coord.y;
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
		this.scale = prevEv.scale;
		return this;
	},

	calcFirst: function(firstEv) {
		if (!firstEv)
			return this;
		this.distanceX = this.pageX - firstEv.pageX;
		this.distanceY = this.pageY - firstEv.pageY;
		this.targetX = firstEv.targetX;
		this.targetY = firstEv.targetY;
		this.distance = Math.sqrt(Math.pow(this.distanceX, 2) + Math.pow(this.distanceY, 2));
		if (this.pinchDistance && firstEv.pinchDistance)
			this.scale = this.pinchDistance / firstEv.pinchDistance;
		return this;
	}
};

var SIMPLE_EVENTS_MOUSE = {
	'mouseup': 'end',
	'mousedown': 'start',
	'mousemove': 'move',
	'mouseout': 'cancel'
};
var SIMPLE_EVENTS_TOUCH = {
	'touchend': 'end',
	'touchstart': 'start',
	'touchmove': 'move',
	'touchcancel': 'cancel',
	'touchleave': 'cancel'
};
function Gesture(element, options) {
	this.options = extend({
		grab: true,
		mouse: true,
		threshold: 50,
		doubletapTimeout: 400,
		longtapTimeout: 500
	}, options);
	this.recognizers = {};
	this.availRecognizers = {};
	this.recognizerCount = 0;
	this.listenElem = this.options.grab ? window : elem;
	this.element = element;
	this.listenEvents = extend({}, SIMPLE_EVENTS_TOUCH, this.options.mouse ? SIMPLE_EVENTS_MOUSE : {});
	this.listeners = {};
	this.gesturing = false;
	this.delegate = null;

	this.startListener = bind(this.start, this);
	this.element.addEventListener('touchstart', this.startListener, false);
	if (this.options.mouse)
		this.element.addEventListener('mousedown', this.startListener, false);
}

Gesture.prototype = {
	addRecognizer: function(recognizer) {
		if (this.availRecognizers.hasOwnProperty(recognizer.type))
			throw "Recognizer of type '" + recognizer.type + "' already added";
		recognizer.gesture = this;
		this.availRecognizers[recognizer.type] = recognizer;
		recognizer.reset();
		return this;
	},
	recognized: function(type, isIt) {
		if(!this.recognizers.hasOwnProperty(type)) {
			console.log("Warning! Calling dead recognizer.");
			return;
		}
		else if (isIt) {
			this.recognizers[type].handle(this.startEv, bind(this.finished, this));
			if(this.delegate)
				this.fire('start', this.startEv);
			this.reset();
		}
		else {
			this.recognizers[type]._reset();
			delete this.recognizers[type];
			this.recognizerCount--;
			this.fire('givedUp');
			if (this.recognizerCount == 0) {
				this.reset();
				this.finished();
			}
		}
	},
	fire: function(name) {
		if (this.delegate && this.delegate[name])
			return this.delegate[name].apply(this.delegate, Array.prototype.slice.call(arguments, 1));

		for (var k in this.recognizers) {
			if (this.recognizers.hasOwnProperty(k) && this.recognizers[k][name])
				this.recognizers[k][name].apply(this.recognizers[k], Array.prototype.slice.call(arguments, 1));
		}
	},
	simpleType: function(eventName) {
		if (this.listenEvents.hasOwnProperty(eventName))
			return this.listenEvents[eventName];
		else
			throw 'Received unknown event!';
	},
	finished: function() {
		this.gesturing = false;
		this.delegate = null;
		for (var k in this.listeners) {
			if (!this.listeners.hasOwnProperty(k))
				continue;
			this.listenElem.removeEventListener(k, this.listeners[k], false);
			delete this.listeners[k];
		}
	},
	reset: function() {
		this.fire('_reset');
		this.recognizers = {};
	},
	start: function(ev) {
		if (this.gesturing)
			return;
		this.gesturing = true;
		this.recognizers = {};
		this.recognizerCount = 0;
		for (var k in this.availRecognizers) {
			if (!this.availRecognizers.hasOwnProperty(k))
				continue;
			this.recognizers[k] = this.availRecognizers[k];
			this.recognizerCount++;
		}
		if (this.recognizerCount == 0) {
			return;
		}

		for (var k in this.listenEvents) {
			if (!this.listenEvents.hasOwnProperty(k))
				continue;
			var l = bind(this['on' + this.listenEvents[k]], this);
			this.listeners[k] = l;
			this.listenElem.addEventListener(k, this.listeners[k], false);
		}
		this.onstart(ev);
	},
	onstart: function(ev) {
		this.startEv = this.moveEv = new DamnEvent('start', this.element)
			.aggregate(ev);
		this.fire('start', this.startEv);
		return claimEvent(ev);
	},
	onmove: function(ev) {
		this.moveEv = new DamnEvent('move', this.element)
			.aggregate(ev)
			.calcPrev(this.moveEv);
			.calcFirst(this.startEv)
		this.fire('move', this.moveEv);
		return claimEvent(ev);
	},
	onend: function(ev) {
		var endEv = new DamnEvent('end', this.element)
			.aggregate(ev)
			.calcPrev(this.moveEv);
			.calcFirst(this.startEv)
		this.fire('end', endEv);
		return claimEvent(ev);
	},
	oncancel: function(ev) {
		if (this.listenElem == window && ev.target.nodeName.toLowerCase != 'html')
			return;
		this.reset();
		this.finished();
	}
};
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
		if (ev.touches.length > 1 || ev.distance > this.gesture.options.threshold)
			return this.notMe();
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
		this.gesture.delegate = new Delegate('onpinch', this, finished);
	},
	end: function(ev) {
		return this.notMe();
	},
	onpinchstart: function() {},
	onpinch: function() {},
	onpinchend: function() {}
});
var SWIPE_DIRECTIONS = {
	left: [1, 0],
	right: [-1, 0],
	up: [0, 1],
	down: [0, -1],
	vertical: [0, true],
	horizontal: [true, 0],
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
				if(dist[i]*this.direction[i] < 0 && dist[i] !== true) {
					this.onswipecancel();
					this.considering = false;
				}
			}
		}
		else if (ev.distance > this.gesture.options.threshold) {
			for(var i = 0, o = 1; i < 2; i++, o--) {
				if(dist[i] === true && Math.abs(this.direction[i]) > Math.abs(dist[o]))
					this.considering = true;
				else if(dist[i]*this.direction[i] > Math.abs(dist[o]))
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
		finished();
	},
	onswipestart: function() {},
	onswipe: function() {},
	onswipeend: function() {},
	onswipecancel: function() {}
});
var dummy = function() {};
jQuery.fn.damnTouch = function(map, options) {
	var l;
	for (var i = 0; i < this.length; i++) {
		var gesture = new Gesture(this[i], options);
		if ('tap' in map) {
			gesture.addRecognizer(l = new TapListener());
			l.ontap = map.tap;
		}
		if ('doubletap' in map) {
			gesture.addRecognizer(l = new DoubletapListener());
			l.ondoubletap = map.doubletap;
		}
		if ('longtap' in map) {
			gesture.addRecognizer(l = new LongtapListener());
			l.onlongtap = map.longtap;
		}
		if ('drag' in map || 'dragstart' in map || 'dragend' in map) {
			gesture.addRecognizer(l = new LongtapListener());
			l.ondragstart = map.dragstart || dummy;
			l.ondrag = map.drag || dummy;
			l.ondragend = map.dragend || dummy;
		}
		if ('pinch' in map || 'pinchstart' in map || 'pinchend' in map) {
			gesture.addRecognizer(l = new LongtapListener());
			l.ondragstart = map.dragstart || dummy;
			l.ondrag = map.drag || dummy;
			l.ondragend = map.dragend || dummy;
		}
	}
};
})();
