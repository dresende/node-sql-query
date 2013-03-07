var SelectQuery = require("./Select").SelectQuery;

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
		}
	};
}
