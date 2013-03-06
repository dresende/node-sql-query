exports.escapeId = function () {
	return Array.prototype.slice.apply(arguments).map(function (el) {
		return "\"" + el.replace(/\"/g, "\"\"") + "\"";
	}).join(".");
};

exports.escapeVal = function (value, timeZone) {
	if (Array.isArray(value)) {
		if (value.length === 1 && Array.isArray(value[0])) {
			return "(" + value[0].map(this.escape.bind(this)) + ")";
		}
		return "(" + value.map(this.escape.bind(this)) + ")";
	}
	switch (typeof value) {
		case "number":
			return value;
		case "boolean":
			return value ? "true" : "false";
	}

	return "'" + value.replace(/\'/g, "''") + "'";
};
