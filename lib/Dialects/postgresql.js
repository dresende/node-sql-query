var helpers = require("../Helpers");

exports.DataTypes = {
	id:    'SERIAL PRIMARY KEY',
	int:   'INTEGER',
	float: 'REAL',
	bool:  'SMALLINT',
	text:  'TEXT'
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
		return el.split(".").map(function (ele) { return "\"" + ele.replace(/\"/g, "\"\"") + "\""; }).join(".");
	}).join(".");
};

exports.escapeVal = function (val, timeZone) {
	if (val === undefined || val === null || typeof val === "symbol") {
		return 'NULL';
	}

	if (Array.isArray(val)) {
		if (val.length === 1 && Array.isArray(val[0])) {
			return "(" + val[0].map(exports.escapeVal.bind(this)) + ")";
		}
		return "(" + val.map(exports.escapeVal.bind(this)).join(", ") + ")";
	}

	if (val instanceof Date) {
		return "'" + helpers.dateToString(val, timeZone || "local", { dialect: 'postgresql' }) + "'";
	}

	if (Buffer.isBuffer(val)) {
		return "'\\x" + val.toString("hex") + "'";
	}

	switch (typeof val) {
		case "number":
			if (!isFinite(val)) {
				val = val.toString();
				break;
			}
			return val;
		case "boolean":
			return val ? "true" : "false";
		case "function":
			return val(exports);
		case "string":
			break;
		default:
			val = JSON.stringify(val);
	}
	// No need to escape backslashes with default PostgreSQL 9.1+ config.
	// Google 'postgresql standard_conforming_strings' for details.
	return "'" + val.replace(/\'/g, "''") + "'";
};

exports.defaultValuesStmt = "DEFAULT VALUES";
