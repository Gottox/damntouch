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
	this.disabled = [];
	this.recognizerCount = 0;
	this.listenElem = this.options.grab ? window : elem;
	this.element = element;
	this.listenEvents = extend({}, SIMPLE_EVENTS_TOUCH, this.options.mouse ? SIMPLE_EVENTS_MOUSE : {});
	this.listeners = {};
	this.events = [];
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
	rmRecognizer: function(recognizer) {
		if (!this.availRecognizers.hasOwnProperty(recognizer.type))
			throw "not added: " + recognizer.type;
		delete this.availRecognizers[recognizer.type];
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
	setDelegate: function(delegate) {
		this.delegate = delegate;
		while(this.events.length) {
			var arg = this.events.shift();
			if (this.delegate && this.delegate[name])
				this.delegate[name].apply(this.delegate, arg);
		}
	},
	fire: function(name) {
		var arg = Array.prototype.slice.call(arguments, 1);
		if (this.delegate && this.delegate[name])
			return this.delegate[name].apply(this.delegate, arg);
		else
			this.events.push(arg);

		for (var k in this.recognizers) {
			if (this.recognizers.hasOwnProperty(k) && this.recognizers[k][name])
				this.recognizers[k][name].apply(this.recognizers[k], arg);
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
		this.events = [];
		this.recognizers = {};
	},
	start: function(ev) {
		if (this.gesturing || ev.button)
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
			.calcPrev(this.moveEv)
			.calcFirst(this.startEv);
		this.fire('move', this.moveEv);
		return claimEvent(ev);
	},
	onend: function(ev) {
		this.moveEv.type = 'end'
		this.fire('end', this.moveEv);
		return claimEvent(ev);
	},
	oncancel: function(ev) {
		if (this.listenElem == window && ev.target.nodeName.toLowerCase() != 'html')
			return;
		this.reset();
		this.finished();
	}
};
