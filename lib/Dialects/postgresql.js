exports.escapeId = function () {
	return Array.prototype.slice.apply(arguments).map(function (el) {
		return "\"" + el.replace(/\"/g, "\"\"") + "\"";
	}).join(".");
};

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
	switch (typeof val) {
		case "number":
			return val;
		case "boolean":
			return val ? "true" : "false";
	}
	// No need to escape backslashes with default PostgreSQL 9.1+ config.
	// Google 'postgresql standard_conforming_strings' for details.
	return "'" + val.replace(/\'/g, "''") + "'";
};
