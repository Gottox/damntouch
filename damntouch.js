(function($, undefined) {
	function manageEvents(add, e, l, mouse) {
		var call = add ? 'addEventListener' : 'removeEventListener';
		e[call]('touchstart', l, false);
		e[call]('touchmove', l, false);
		e[call]('touchend', l, false);
		if(mouse) {
			e[call]('mousedown', l, false);
			e[call]('mousemove', l, false);
			e[call]('mouseup', l, false);
		}
	}

	function swipeRecognizer(gesture, rate) {
		this.horizontal = (gesture === 'hSwipe');
		this.rate = rate;
	}
	swipeRecognizer.prototype = {
		start: function(ev) {
		
		},
		move: function(ev) {
		
		},
		end: function(ev) {
		
		},
		handle: function(e) {
		
		}
	}

	function pinchRecognizer(gesture, rate) {
		this.rate = rate;
	}
	pinchRecognizer.prototype = {
		start: function(ev) {
		
		},
		move: function(ev) {
		
		},
		end: function(ev) {
		
		},
		handle: function(e) {
		
		}
	}

	function dragRecognizer(gesture, rate) {
		this.rate = rate;
		this.threshold = 20;
	}
	dragRecognizer.prototype = {
		start: function(ev) {
			this.x = ev.pageX;
			this.y = ev.pageY;
		},
		move: function(ev) {
			if(Math.abs(this.x - ev.pageX) > this.threshold || Math.abs(this.y - ev.pageY) > this.threshold)
				this.rate(true);
		},
		end: function(ev) {
			this.rate(false);
		},
		handle: function(e) {
		
		}
	}

	function doubletapRecognizer(gesture, rate) {
		this.rate = rate;
		this.timeout = 500;
		this.threshold = 50;
		this.clicks = 0;
	}
	doubletapRecognizer.prototype = {
		start: function(ev) {
			if (this.clicks == 0){
				var self = this;
				this.x = ev.pageX;
				this.y = ev.pageY;
				setTimeout(function() {
					self.rate(false);
				}, this.timeout);
			}
			else {
				this.move(ev);
				this.rate(true);
			}
			this.clicks++;
		},
		move: function(ev) {
			if(Math.abs(this.x - ev.pageX) > this.threshold || Math.abs(this.y - ev.pageY) > this.threshold)
				this.rate(false);
		},
		end: function(ev) {
		
		},
		handle: function(e) {
			e.trigger('doubletap');
		}
	}

	function tapRecognizer(gesture, rate, rec) {
		this.rate = rate;
		this.threshold = 50;
		this.timeout = 500;
		this.clicks = 0;
		this.rec = rec;
	}
	tapRecognizer.prototype = {
		start: function(ev) {
			this.clicks++;
			this.x = ev.pageX;
			this.y = ev.pageY;
		},
		move: function(ev) {
			if(Math.abs(this.x - ev.pageX) > this.threshold || Math.abs(this.y - ev.pageY) > this.threshold)
				this.rate(false);
		},
		end: function(ev) {
			this.ended = true;
			if('doubletap' in this.rec === false)
				this.rate(true);
		},
		giveUp: function() {
			if(this.ended)
				this.end();
		},
		handle: function(e) {
			// TODO
			e.trigger('tap');
		}
	}

	function HoldRecognizer(gesture, rate, rec) {
		this.rate = rate;
		this.timeout = 1000;
		this.threshold = 50;
	}
	HoldRecognizer.prototype = {
		start: function(ev) {
			var self = this;
			this.x = ev.pageX;
			this.y = ev.pageY;
			setTimeout(function() {
				self.rate(true);
			}, this.timeout);
		},
		move: function(ev) {
			if(Math.abs(this.x - ev.pageX) > this.threshold || Math.abs(this.x - ev.pageY) > this.threshold)
				this.rate(false);
		},
		end: function(ev) {
			this.rate(false);
		},
		handle: function(e) {
			// TODO
			e.trigger('hold');
		}
	}

	var recognizers = {
		vSwipe: swipeRecognizer,
		hSwipe: swipeRecognizer,
		pinch: pinchRecognizer,
		drag: dragRecognizer,
		doubletap: doubletapRecognizer,
		tap: tapRecognizer,
		hold: HoldRecognizer
	}
	var eventmap = {
		vSwipe: 'vSwipe',
		hSwipe: 'hSwipe',
		pinchstart: 'pinch',
		pinch: 'pinch',
		pinchstop: 'pinch',
		dragstart: 'drag',
		drag: 'drag',
		dragend: 'drag',
		doubletap: 'doubletap',
		tap: 'tap',
		hold: 'hold'
	}

	var defopt = {
		mouse: true,
		escalate: true
	};

	$.fn.damntouch = function(listener, opt) {
		opt = $.extend({}, defopt, opt);

		this.on(listener);
		for(var i = 0; i < this.length; i++) {
			var ini = init.bind(this[i], listener, opt);
			this[i].addEventListener('touchstart', ini);
			if(opt.mouse)
				this[i].addEventListener('mousedown', ini);
		}
		return this;
	}

	function init(listener, opt, ev) {
		var rec = {};
		var done = false;
		var self = $(this);
		if(self.data('gesturing'))
			return;
		self.data('gesturing', true);

		var t = opt.escalate ? $(window) : self;
		ev.preventDefault();
		ev.stopPropagation();

		var count = 0;

		var finished = function() {
			done = true;
			self.data('gesturing', false);
		}

		var rate = function(k, r) {
			if(done || count == 0) 
				return;
			if(k in rec)
				console.log(arguments);
			if(r === true && k in rec) {
				manageEvents(false, t[0], recognize, opt.mouse);
				finished();
				rec[k].handle(self);
				return;
			}
			else if(r === false) {
				count--;
				delete rec[k];
				for(var k2 in rec) {
					if(rec[k2].giveUp)
						rec[k2].giveUp();
				}
			}
			if(count == 0) {
				manageEvents(false, t[0], recognize, opt.mouse);
				finished();
			}
		}

		for(var k in listener) {
			if(!eventmap[k])
				throw "unknown event type '"+k+'"';

			var id = eventmap[k];
			if(!rec[id]) {
				rec[id] = new (recognizers[id])(id, rate.bind(self, id), rec);
				count++;
			}
		}

		var recognize = function(ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			for(var k in rec) {
				if(done)
					break;
				var type;
				switch(ev.type) {
				case 'touchstart':
				case 'mousedown':
					type = 'start';
					break;
				case 'touchmove':
				case 'mousemove':
					type = 'move';
					break;
				case 'touchend':
				case 'mouseup':
					type = 'end';
					break;
				case 'mouseout':
				case 'dragout':
					finished();
				}
				if(rec[k][type])
					rec[k][type](ev);
			}
		}
		recognize(ev);
		manageEvents(true, t[0], recognize, opt.mouse);
	}
})(jQuery)
