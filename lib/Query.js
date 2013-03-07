var SelectQuery = require("./Select").SelectQuery;
var RemoveQuery = require("./Remove").RemoveQuery;

exports.Query = Query;

function Query(opts) {
	if (typeof opts == "string") {
		opts = { dialect: opts };
	} else {
		opts = opts || {};
	}

	var Dialect = require("./Dialects/" + (opts.dialect || "mysql"));

	return {
		select: function () {
			return new SelectQuery(Dialect);
		},
		remove: function () {
			return new RemoveQuery(Dialect);
		}
	};
}
