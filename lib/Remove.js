var Where = require("./Where");

exports.RemoveQuery = RemoveQuery;

function RemoveQuery(Dialect, opts) {
	var sql = {
		where : [],
		order : []
	};

	return {
		from: function (table) {
			sql.table = table;
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
			var query = [], tmp;

			query.push("DELETE FROM");
			query.push(Dialect.escapeId(sql.table));

			query = query.concat(Where.build(Dialect, sql.where, opts));

			// order
			if (sql.order.length > 0) {
				tmp = [];
				for (i = 0; i < sql.order.length; i++) {
					if (Array.isArray(sql.order[i].c)) {
						tmp.push(Dialect.escapeId.apply(Dialect, sql.order[i].c) + " " + sql.order[i].d);
					} else {
						tmp.push(Dialect.escapeId(sql.order[i].c) + " " + sql.order[i].d);
					}
				}

				if (tmp.length > 0) {
					query.push("ORDER BY " + tmp.join(", "));
				}
			}

			// limit
			if (sql.hasOwnProperty("limit")) {
				if (sql.hasOwnProperty("offset")) {
					query.push("LIMIT " + sql.limit + " OFFSET " + sql.offset);
				} else {
					query.push("LIMIT " + sql.limit);
				}
			} else if (sql.hasOwnProperty("offset")) {
				query.push("OFFSET " + sql.offset);
			}

			return query.join(" ");
		},
		offset: function (offset) {
			sql.offset = offset;
			return this;
		},
		limit: function (limit) {
			sql.limit = limit;
			return this;
		},
		order: function (column, dir) {
			sql.order.push({
				c : Array.isArray(column) ? [ get_table_alias(column[0]), column[1] ] : column,
				d : (dir == "Z" ? "DESC" : "ASC")
			});
			return this;
		}
	};
}
