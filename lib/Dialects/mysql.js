var util    = require("util");
var helpers = require("../Helpers");

exports.DataTypes = {
    id: 'INTEGER PRIMARY KEY AUTO_INCREMENT',
    int: 'INTEGER',
    float: 'FLOAT(12,2)',
    bool: 'TINYINT(1)',
    text: 'TEXT'
};


exports.escape = function (query, args) {
	return helpers.escapeQuery(exports, query, args);
}

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
		return arrayToList(val, timeZone || "local");
	}

	if (util.isDate(val)) {
		val = helpers.dateToString(val, timeZone || "local", { dialect: 'mysql' });
	} else {
		switch (typeof val) {
			case 'boolean':
				return (val) ? 'true' : 'false';
			case 'number':
				if (!isFinite(val)) {
					val = val.toString();
					break;
				}
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
