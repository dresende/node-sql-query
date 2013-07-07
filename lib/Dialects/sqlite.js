var util = require("util");

exports.escapeId = require("./mysql").escapeId;

exports.escapeVal = function (val, timeZone) {
	if (val === undefined || val === null) {
		return 'NULL';
	}

	if (Array.isArray(val)) {
		if (val.length === 1 && Array.isArray(val[0])) {
			return "(" + val[0].map(exports.escapeVal.bind(this)) + ")";
		}
		return "(" + val.map(exports.escapeVal.bind(this)).join(", ") + ")";
	}

	if (util.isDate(val)) {
		return "'" + JSON.stringify(val).substr(1, 24) + "'";
	}

	if (Buffer.isBuffer(val)) {
		return "X'" + val.toString("hex") + "'";
	}

	switch (typeof val) {
		case "number":
			return val;
		case "boolean":
			return val ? "true" : "false";
		case "function":
			return val(exports);
	}

	// No need to escape backslashes with default PostgreSQL 9.1+ config.
	// Google 'postgresql standard_conforming_strings' for details.
	return "'" + val.replace(/\'/g, "''") + "'";
};
