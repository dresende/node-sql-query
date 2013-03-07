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
			var query = [], cols = [], vals = [];

			query.push("INSERT INTO");
			query.push(Dialect.escapeId(sql.table));

			if (sql.hasOwnProperty("set")) {
				for (var k in sql.set) {
					cols.push(Dialect.escapeId(k));
					vals.push(Dialect.escapeVal(sql.set[k]));
				}
				query.push("(" + cols.join(", ") + ")");
				query.push("VALUES (" + vals.join(", ") + ")");
			}

			return query.join(" ");
		}
	};
}
