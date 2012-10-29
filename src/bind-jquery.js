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
	}
};
