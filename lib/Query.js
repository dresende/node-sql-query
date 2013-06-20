var SelectQuery = require("./Select").SelectQuery;
var InsertQuery = require("./Insert").InsertQuery;
var UpdateQuery = require("./Update").UpdateQuery;
var RemoveQuery = require("./Remove").RemoveQuery;
var Comparators = require("./Comparators");

exports.Query = Query;
exports.Comparators = Object.keys(Comparators);
exports.Text = buildQueryType("text");

for (var comparator in Comparators) {
	exports[comparator] = Comparators[comparator];
}

function Query(opts) {
	if (typeof opts == "string") {
		opts = { dialect: opts };
	} else {
		opts = opts || {};
	}

	var Dialect = require("./Dialects/" + (opts.dialect || "mysql"));

	return {
		escapeId: Dialect.escapeId.bind(Dialect),
		escapeVal: Dialect.escapeVal.bind(Dialect),
		select: function () {
			return new SelectQuery(Dialect);
		},
		insert: function () {
			return new InsertQuery(Dialect);
		},
		update: function () {
			return new UpdateQuery(Dialect);
		},
		remove: function () {
			return new RemoveQuery(Dialect);
		}
	};
}

function buildQueryType(type) {
	return function (data) {
		var o = { data: data };

		Object.defineProperty(o, "type", {
			value: function () {
				return type;
			},
			enumerable: false
		});

		return o;
	};
}
