var helpers = require("../Helpers");

exports.DataTypes = {
	id:    'INT IDENTITY(1,1) NOT NULL PRIMARY KEY',
	int:   'INT',
	float: 'FLOAT',
	bool:  'BIT',
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
		return "[" + el + "]";
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
		return "'" + helpers.dateToString(val, timeZone || "local", { dialect: 'mssql' }) + "'";
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
		case "string":
			break;
		default:
			val = JSON.stringify(val);
	}

	return "'" + val.replace(/\'/g, "''") + "'";
};

exports.defaultValuesStmt = "DEFAULT VALUES";

exports.limitAsTop = true;
