var Set   = require("./Set");
var Where = require("./Where");

exports.UpdateQuery = UpdateQuery;

function UpdateQuery(Dialect) {
	var sql = {
		where : []
	};

	return {
		into: function (table) {
			sql.table = table;
			return this;
		},
		set: function (values) {
			sql.set = values;
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

			query.push("UPDATE");
			query.push(Dialect.escapeId(sql.table));

			query = query.concat(Set.build(Dialect, sql.set));
			query = query.concat(Where.build(Dialect, sql.where));

			return query.join(" ");
		}
	};
}
