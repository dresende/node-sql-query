var util = require("util");

exports.escapeId = function () {
	return Array.prototype.slice.apply(arguments).map(function (el) {
		if (typeof el == "object") {
			return el.str.replace(/\?:(id|value)/g, function (m) {
				if (m == "?:id") {
					return exports.escapeId(el.escapes.shift());
				}
				// ?:value
				return exports.escapeVal(el.escapes.shift());
			});
		}
		return "`" + el.replace(/`/g, '``') + "`";
	}).join(".");
};

exports.escapeVal = function (val, timeZone) {
	if (val === undefined || val === null) {
		return 'NULL';
	}

	if (Buffer.isBuffer(val)) {
		return bufferToString(val);
	}

	if (Array.isArray(val)) {
		return arrayToList(val, timeZone || "Z");
	}

	if (util.isDate(val)) {
		val = dateToString(val, timeZone || "Z");
	} else {
		switch (typeof val) {
			case 'boolean':
				return (val) ? 'true' : 'false';
			case 'number':
				return val + '';
			case "object":
				return objectToValues(val, timeZone || "Z");
			case "function":
				return val(exports);
		}
	}

	val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
		switch(s) {
			case "\0": return "\\0";
			case "\n": return "\\n";
			case "\r": return "\\r";
			case "\b": return "\\b";
			case "\t": return "\\t";
			case "\x1a": return "\\Z";
			default: return "\\" + s;
		}
	});

	return "'" + val + "'";
};

function objectToValues(object, timeZone) {
	var values = [];
	for (var key in object) {
		var value = object[key];

		if(typeof value === 'function') {
			continue;
		}

		values.push(exports.escapeId(key) + ' = ' + exports.escapeVal(value, timeZone));
	}

	return values.join(', ');
}

function arrayToList(array, timeZone) {
	return "(" + array.map(function(v) {
		if (Array.isArray(v)) return arrayToList(v);
		return exports.escapeVal(v, timeZone);
	}).join(', ') + ")";
}

function bufferToString(buffer) {
	var hex = '';

	try {
		hex = buffer.toString('hex');
	} catch (err) {
		// node v0.4.x does not support hex / throws unknown encoding error
		for (var i = 0; i < buffer.length; i++) {
			var b = buffer[i];
			hex += zeroPad(b.toString(16));
		}
	}

	return "X'" + hex+ "'";
}

function dateToString(date, timeZone) {
	var dt = new Date(date);

	if (timeZone != 'local') {
		var tz = convertTimezone(timeZone);

		dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
		if (tz !== false) {
			dt.setTime(dt.getTime() + (tz * 60000));
		}
	}

	var year   = dt.getFullYear();
	var month  = zeroPad(dt.getMonth() + 1);
	var day    = zeroPad(dt.getDate());
	var hour   = zeroPad(dt.getHours());
	var minute = zeroPad(dt.getMinutes());
	var second = zeroPad(dt.getSeconds());

	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

function zeroPad(number) {
	return (number < 10) ? '0' + number : number;
}

function convertTimezone(tz) {
	if (tz == "Z") return 0;

	var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
	if (m) {
		return (m[1] == '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
	}
	return false;
}
