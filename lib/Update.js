var Set   = require("./Set");
var Where = require("./Where");

exports.UpdateQuery = UpdateQuery;

function UpdateQuery(Dialect, opts) {
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
			for (var i = 0; i < arguments.length; i++) {
				sql.where.push({
					t: null,
					w: arguments[i]
				});
			}
			return this;
		},
		build: function () {
			var query = [];

			query.push("UPDATE");
			query.push(Dialect.escapeId(sql.table));

			query = query.concat(Set.build(Dialect, sql.set, opts));
			query = query.concat(Where.build(Dialect, sql.where, opts));

			return query.join(" ");
		}
	};
}
