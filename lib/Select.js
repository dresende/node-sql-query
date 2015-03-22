var Helpers = require('./Helpers');
var Where   = require("./Where");
var aggregate_functions = [
	"ABS", "CEIL", "FLOOR", "ROUND",
	"AVG", "MIN", "MAX",
	"LOG", "LOG2", "LOG10", "EXP", "POWER",
	"ACOS", "ASIN", "ATAN", "COS", "SIN", "TAN",
	"CONV", "RANDOM", "RAND", "RADIANS", "DEGREES",
	"SUM", "COUNT", "DISTINCT"
];

exports.SelectQuery = SelectQuery;

function SelectQuery(Dialect, opts) {
	var sql = {
		from         : [],
		where        : [],
		order        : [],
		group_by     : null,
		found_rows   : false,
		where_exists : false
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
		return function () {
			if (arguments.length === 0) {
				fun_stack.push(fun);
				return this;
			}

			var column = Array.prototype.slice.apply(arguments);
			var alias  = (column.length > 1 && typeof column[column.length - 1] == "string" ? column.pop() : null);

			if (column.length && Array.isArray(column[0])) {
				column = column[0].concat(column.slice(1));
			}

			return this.fun(fun, column.length && column[0] ? column : '*', alias);
		};
	};
	var proto = {
		select: function (fields) {
			if (fields) {
				if (!sql.from[sql.from.length - 1].select) {
					sql.from[sql.from.length - 1].select = [];
				}
				sql.from[sql.from.length - 1].select = sql.from[sql.from.length - 1].select.concat(
					Array.isArray(fields)
						? fields
						: Array.prototype.slice.apply(arguments)
				);
			}
			return this;
		},
		calculateFoundRows: function () {
			sql.found_rows = true;

			return this;
		},
		as: function (alias) {
			var idx = sql.from.length - 1;

			if (sql.from[idx].select.length) {
				var idx2 = sql.from[idx].select.length - 1;

				if (typeof sql.from[idx].select[idx2] == "string") {
					sql.from[idx].select[idx2] = { c: sql.from[idx].select[idx2] };
				}
				sql.from[idx].select[sql.from[idx].select.length - 1].a = alias || null;
			}

			return this;
		},
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
		from: function (table, from_id, to_table, to_id, fromOpts) {
			var from = {
				t: table,							// table
				a: "t" + (sql.from.length + 1)		// alias
			};

			if (sql.from.length === 0) {
				sql.from.push(from);
				return this;
			}

			var a, f = from_id, t;
			var args = Array.prototype.slice.call(arguments);
			var last = args[args.length - 1];

			if (typeof last == 'object' && !Array.isArray(last)) {
				from.opts = args.pop();
			}

			if (args.length == 3) {
				a = sql.from[sql.from.length - 1].a;
				t = to_table;
			} else {
				a = get_table_alias(to_table);
				t = to_id;
			}

			from.j = [];
			if (f.length && t.length) {
				if (Array.isArray(f) && Array.isArray(t) && f.length == t.length) {
					for (i = 0; i < f.length; i++) {
						from.j.push([f[i], a, t[i]]);
					}
				} else {
					from.j.push([f, a, t]);
				}
			} else {
					throw new Error();
			}

			sql.from.push(from);
			return this;
		},
		where: function () {
			var where = null;

			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] === null) {
					continue;
				}
				if (typeof arguments[i] == "string") {
					if (where !== null) {
						sql.where.push(where);
					}
					where = {
						t: get_table_alias(arguments[i]),
						w: arguments[i + 1]
					};
					i++;
				} else {
					if (where !== null) {
						sql.where.push(where);
					}
					where = {
						t: null,
						w: arguments[i]
					};
				}
			}
			if (where !== null) {
				sql.where.push(where);
			}
			return this;
		},
		whereExists: function (table, table_link, link, conditions) {
			sql.where.push({
				t: (sql.from.length ? sql.from[sql.from.length - 1].a : null),
				w: conditions,
				e: { t: table, tl: get_table_alias(table_link), l: link }
			});
			sql.where_exists = true;
			return this;
		},
		groupBy: function () {
			sql.group_by = Array.prototype.slice.apply(arguments);
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
			if (Array.isArray(dir)) {
				sql.order.push(
					Helpers.escapeQuery(Dialect, column, dir)
				);
			} else {
				sql.order.push({
					c : Array.isArray(column) ? [ get_table_alias(column[0]), column[1] ] : column,
					d : (dir == "Z" ? "DESC" : "ASC")
				});
			}
			return this;
		},
		build: function () {
			var query = [], tmp, from, i, ii, j, ord, str, select_all = true;
			var having = [];

			if (fun_stack.length) {
				this.fun(fun_stack.pop());
			}

			query.push("SELECT");

			for (i = 0; i < sql.from.length; i++) {
				sql.from[i].a = "t" + (i + 1);
			}

			tmp = [];
			for (i = 0; i < sql.from.length; i++) {
				if (!sql.from[i].select) continue;
				// if (typeof sql.from[i].select[0] != "object") continue;
				//

				for (j = 0; j < sql.from[i].select.length; j++) {
					if (typeof sql.from[i].select[j] == "string" ) {
						if (sql.from.length == 1) {
							tmp.push(Dialect.escapeId(sql.from[i].select[j]));
						} else {
							tmp.push(Dialect.escapeId(sql.from[i].a, sql.from[i].select[j]));
						}
						continue;
					}
					if (typeof sql.from[i].select[j] == "object") {
						if (!sql.from[i].select[j].f && sql.from[i].select[j].c) {
							if (sql.from.length == 1) {
								tmp.push(Dialect.escapeId(sql.from[i].select[j].c));
							} else {
								tmp.push(Dialect.escapeId(sql.from[i].a, sql.from[i].select[j].c));
							}
							if (sql.from[i].select[j].a) {
								tmp[tmp.length - 1] += " AS " + Dialect.escapeId(sql.from[i].select[j].a);
							}
						}
						if (sql.from[i].select[j].having) {
							having.push(Dialect.escapeId(sql.from[i].select[j].having));
						}
						if (sql.from[i].select[j].select) {
							tmp.push(Dialect.escapeId(sql.from[i].select[j].select));
							continue;
						}
					}

					if (typeof sql.from[i].select[j] == "function") {
						tmp.push(sql.from[i].select[j](Dialect));
						continue;
					}

					str = sql.from[i].select[j].f + "(";

					if (sql.from[i].select[j].f) {
						str = sql.from[i].select[j].f + "(";

						if (sql.from[i].select[j].c && !Array.isArray(sql.from[i].select[j].c)) {
							sql.from[i].select[j].c = [ sql.from[i].select[j].c ];
						}

						if (Array.isArray(sql.from[i].select[j].c)) {
							str += sql.from[i].select[j].c.map(function (el) {
								if (!el) {
									return Dialect.escapeVal(el);
								}
								if (typeof el.type == "function") {
									switch (el.type()) {
										case "text":
											return Dialect.escapeVal(el.data, opts.timezone);
										default:
											return el;
									}
								}
								if (typeof el != "string") {
									return el;
								}
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
					} else if (sql.from[i].select[j].sql) {
						str = '(' + sql.from[i].select[j].sql + ')';
					} else {
						continue;
					}

					str += (sql.from[i].select[j].a ? " AS " + Dialect.escapeId(sql.from[i].select[j].a) : "");

					if (sql.from[i].select[j].s && sql.from[i].select[j].s.length > 0) {
						str = sql.from[i].select[j].s.join("(") + "(" + str +
						      ((new Array(sql.from[i].select[j].s.length + 1)).join(")"));
					}

					tmp.push(str);
				}
			}

			// MySQL specific!
			if (sql.found_rows) {
				query.push("SQL_CALC_FOUND_ROWS");
			}

			if (tmp.length) {
				query.push(tmp.join(", "));
			} else {
				query.push("*");
			}

			if (sql.from.length > 0) {
				query.push("FROM");

				if (sql.from.length > 2) {
					query.push((new Array(sql.from.length - 1)).join("("));
				}

				for (i = 0; i < sql.from.length; i++) {
					from = sql.from[i];

					if (i > 0) {
						if (from.opts && from.opts.joinType) {
							query.push(from.opts.joinType.toUpperCase());
						}
						query.push("JOIN");
					}
					if (sql.from.length == 1 && !sql.where_exists) {
						query.push(Dialect.escapeId(from.t));
					} else {
						query.push(Dialect.escapeId(from.t) + " " + Dialect.escapeId(from.a));
					}
					if (i > 0) {
						query.push("ON");

						for (ii = 0; ii < from.j.length; ii++) {
							if (ii > 0) {
								query.push("AND");
							}
							query.push(
								Dialect.escapeId(from.a, from.j[ii][0]) +
								" = " +
								Dialect.escapeId(from.j[ii][1], from.j[ii][2])
							);
						}

						if (i < sql.from.length - 1) {
							query.push(")");
						}
					}
				}
			}

			if (having.length > 0) {
				for (i = 0; i < having.length; i++) {
					query.push( (i === 0 ? "HAVING" : "AND") + having[i]);
				}
			}

			query = query.concat(Where.build(Dialect, sql.where, opts));

			if (sql.group_by !== null) {
				query.push("GROUP BY " + sql.group_by.map(function (column) {
					if (column[0] == "-") {
						sql.order.unshift({ c: column.substr(1), d: "DESC" });
						return Dialect.escapeId(column.substr(1));
					}
					return Dialect.escapeId(column);
				}).join(", "));
			}

			// order
			if (sql.order.length > 0) {
				tmp = [];
				for (i = 0; i < sql.order.length; i++) {
					ord = sql.order[i];

					if (typeof ord == 'object') {
						if (Array.isArray(ord.c)) {
							tmp.push(Dialect.escapeId.apply(Dialect, ord.c) + " " + ord.d);
						} else {
							tmp.push(Dialect.escapeId(ord.c) + " " + ord.d);
						}
					} else if (typeof ord == 'string') {
						tmp.push(ord);
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

	for (var i = 0; i < aggregate_functions.length; i++) {
		proto[aggregate_functions[i].toLowerCase()] = aggregate_fun(aggregate_functions[i]);
	}

	return proto;
}
