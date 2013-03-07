var Where = require("./Where");

exports.RemoveQuery = RemoveQuery;

function RemoveQuery(Dialect) {
	var sql = {
		where : []
	};

	return {
		from: function (table) {
			sql.table = table;
			return this;
		},
		where: function () {
			var where = [];
			for (var i = 0; i < arguments.length; i++) {
				where.push({
					t: null,
					w: arguments[i]
				});
			}
			sql.where.push(where);
			return this;
		},
		build: function () {
			var query = [];

			query.push("DELETE FROM");
			query.push(Dialect.escapeId(sql.table));

			query = query.concat(Where.build(Dialect, sql.where));

			return query.join(" ");
		}
	};
}
