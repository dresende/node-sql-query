var Set = require("./Set");

exports.InsertQuery = InsertQuery;

function InsertQuery(Dialect) {
	var sql = {};

	return {
		into: function (table) {
			sql.table = table;
			return this;
		},
		set: function (values) {
			sql.set = values;
			return this;
		},
		build: function () {
			var query = [];

			query.push("INSERT INTO");
			query.push(Dialect.escapeId(sql.table));

			query = query.concat(Set.build(Dialect, sql.set));

			return query.join(" ");
		}
	};
}
