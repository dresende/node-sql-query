var Where = require("./Where");

exports.SelectQuery = SelectQuery;

function SelectQuery(Dialect) {
	var sql = {
		from  : [],
		where : [],
		order : []
	};
	var get_table_alias = function (table) {
		for (var i = 0; i < sql.from.length; i++) {
			if (sql.from[i].t == table) {
				return sql.from[i].a;
			}
		}
		return table;
	};
	var fun_stack = []; // function stack
	var aggregate_fun = function (fun) {
		return function (column, alias) {
			if (arguments.length === 0) {
				fun_stack.push(fun);
				return this;
			}
			return this.fun(fun, column, alias);
		};
	};

	return {
		select: function (fields) {
			if (fields) {
				sql.from[sql.from.length - 1].select = (Array.isArray(fields) ? fields : Array.prototype.slice.apply(arguments));
			}
			return this;
		},

		count : aggregate_fun("COUNT"),
		min   : aggregate_fun("MIN"),
		max   : aggregate_fun("MAX"),
		sum   : aggregate_fun("SUM"),
		avg   : aggregate_fun("AVG"),

		fun: function (fun, column, alias) {
			if (!Array.isArray(sql.from[sql.from.length - 1].select)) {
				sql.from[sql.from.length - 1].select = [];
			}
			sql.from[sql.from.length - 1].select.push({
				f: fun.toUpperCase(),
				c: (column && column != "*" ? column : null),
				a: (alias || null),
				s: fun_stack
			});
			fun_stack = [];
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
				if (arguments[i] === null) {
					continue;
				}
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
			if (where.length > 0) {
				sql.where.push(where);
			}
			return this;
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
		},
		build: function () {
			var query = [], tmp, i, j, str, select_all = true;

			if (fun_stack.length) {
				this.fun(fun_stack.pop());
			}

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
						str = sql.from[i].select[j].f + "(";

						if (sql.from[i].select[j].c && !Array.isArray(sql.from[i].select[j].c)) {
							sql.from[i].select[j].c = [ sql.from[i].select[j].c ];
						}

						if (Array.isArray(sql.from[i].select[j].c)) {
							str += sql.from[i].select[j].c.map(function (el) {
								if (sql.from.length == 1) {
									return Dialect.escapeId(el);
								} else {
									return Dialect.escapeId(sql.from[i].a, el);
								}
							}).join(", ");
						} else {
							str += "*";
						}

						str += ")";
						str += (sql.from[i].select[j].a ? " AS " + Dialect.escapeId(sql.from[i].select[j].a) : "");

						if (sql.from[i].select[j].s.length > 0) {
							str = sql.from[i].select[j].s.join("(") + "(" + str +
							      ((new Array(sql.from[i].select[j].s.length + 1)).join(")"));
						}

						tmp.push(str);
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
						query.push(Dialect.escapeId(sql.from[i].t) + " " + Dialect.escapeId(sql.from[i].a));
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
		}
	};
}
