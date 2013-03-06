var SelectQuery = require("./Select").SelectQuery;

exports.Query = Query;

function Query(opts) {
	opts = opts || {};

	var Dialect = require("./Dialects/" + (opts.dialect || "mysql"));

	return {
		select: function () {
			return new SelectQuery(Dialect);
		}
	};
}
