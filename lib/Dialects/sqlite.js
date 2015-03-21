var util    = require("util");
var helpers = require("../Helpers");


exports.DataTypes = {
	isSQLITE: true,
	id:      'INTEGER PRIMARY KEY AUTOINCREMENT',
	int:     'INTEGER',
	float:   'FLOAT(12,2)',
	bool:    'TINYINT(1)',
	text:    'TEXT'
};

exports.escape = function (query, args) {
	return helpers.escapeQuery(exports, query, args);
}

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
		return "'" + helpers.dateToString(val, timeZone || "local", { dialect: 'sqlite' }) + "'";
	}

	if (Buffer.isBuffer(val)) {
		return "X'" + val.toString("hex") + "'";
	}

	switch (typeof val) {
		case "number":
			if (!isFinite(val)) {
				val = val.toString();
				break;
			}
			return val;
		case "boolean":
			return val ? 1 : 0;
		case "function":
			return val(exports);
	}

	// No need to escape backslashes with default PostgreSQL 9.1+ config.
	// Google 'postgresql standard_conforming_strings' for details.
	return "'" + val.replace(/\'/g, "''") + "'";
};

exports.defaultValuesStmt = "DEFAULT VALUES";
