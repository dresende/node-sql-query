var Where = require("./Where");

exports.SelectQuery = SelectQuery;

function SelectQuery(Dialect) {
	var sql = {
		from  : [],
		where : []
	};
	var get_table_alias = function (table) {
		for (var i = 0; i < sql.from.length; i++) {
			if (sql.from[i].t == table) {
				return sql.from[i].a;
			}
		}
		return table;
	};

	return {
		select: function () {
			sql.from[sql.from.length - 1].select = Array.prototype.slice.apply(arguments);
			return this;
		},
		count: function (column, alias) {
			return this.fun("COUNT", column, alias);
		},
		fun: function (fun, column, alias) {
			if (!Array.isArray(sql.from[sql.from.length - 1].select)) {
				sql.from[sql.from.length - 1].select = [];
			}
			sql.from[sql.from.length - 1].select.push({
				f: fun.toUpperCase(),
				c: (column && column != "*" ? column : null),
				a: (alias || null)
			});
			return this;
		},
		from: function (table, from_id, to_table, to_id) {
			var from = {
				t: table,							// table
				a: "t" + (sql.from.length + 1)		// alias
			};

			if (sql.from.length === 0) {
				sql.from.push(from);
				return this;
			}

			if (arguments.length == 3) {
				from.j = [ from_id, sql.from[sql.from.length - 1].a, to_table ];
			} else {
				from.j = [ from_id, get_table_alias(to_table), to_id ];
			}
			sql.from.push(from);
			return this;
		},
		where: function () {
			var where = [];
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "string") {
					where.push({
						t: get_table_alias(arguments[i]),
						w: arguments[i + 1]
					});
					i++;
				} else {
					where.push({
						t: null,
						w: arguments[i]
					});
				}
			}
			sql.where.push(where);
			return this;
		},
		build: function () {
			var query = [], tmp, i, j, select_all = true;

			query.push("SELECT");

			for (i = 0; i < sql.from.length; i++) {
				sql.from[i].a = "t" + (i + 1);
				if (sql.from[i].select && typeof sql.from[i].select[0] == "object") {
					continue;
				}
				if (sql.from[i].select) {
					select_all = false;
					break;
				}
			}
			if (select_all) {
				tmp = [];
				for (i = 0; i < sql.from.length; i++) {
					if (!sql.from[i].select) continue;
					if (typeof sql.from[i].select[0] != "object") continue;

					for (j = 0; j < sql.from[i].select.length; j++) {
						tmp.push(
							sql.from[i].select[j].f + "(" +
							(sql.from[i].select[j].c ? Dialect.escapeId(sql.from[i].a, sql.from[i].select[j].c) : "*") +
							")" +
							(sql.from[i].select[j].a ? " AS " + Dialect.escapeId(sql.from[i].select[j].a) : "")
						);
					}
				}
				if (tmp.length) {
					query.push(tmp.join(", "));
				} else {
					query.push("*");
				}
			} else {
				tmp = [];
				for (i = 0; i < sql.from.length; i++) {
					if (!sql.from[i].select) {
						if (sql.from.length == 1) {
							tmp.push("*");
						} else {
							tmp.push(Dialect.escapeId(sql.from[i].a) + ".*");
						}
					} else {
						if (sql.from.length == 1) {
							sql.from[i].select.map(function (col) {
								tmp.push(Dialect.escapeId(col));
							}.bind(this));
						} else {
							sql.from[i].select.map(function (col) {
								tmp.push(Dialect.escapeId(sql.from[i].a, col));
							}.bind(this));
						}
					}
				}

				query.push(tmp.join(", "));
			}

			if (sql.from.length > 0) {
				query.push("FROM");

				if (sql.from.length > 2) {
					query.push((new Array(sql.from.length - 1)).join("("));
				}

				for (i = 0; i < sql.from.length; i++) {
					if (i > 0) {
						query.push("JOIN");
					}
					if (sql.from.length == 1) {
						query.push(Dialect.escapeId(sql.from[i].t));
					} else {
						query.push(Dialect.escapeId(sql.from[i].t) + " AS " + Dialect.escapeId(sql.from[i].a));
					}
					if (i > 0) {
						query.push(
							"ON " +
							Dialect.escapeId(sql.from[i].a, sql.from[i].j[0]) +
							" = " +
							Dialect.escapeId(sql.from[i].j[1], sql.from[i].j[2])
						);

						if (i < sql.from.length - 1) {
							query.push(")");
						}
					}
				}
			}

			query = query.concat(Where.build(Dialect, sql.where));

			return query.join(" ");
		}
	};
}
