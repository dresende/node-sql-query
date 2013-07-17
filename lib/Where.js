exports.build = function (Dialect, where) {
	if (where.length === 0) {
		return [];
	}

	var query = [], subquery;

	for (var i = 0; i < where.length; i++) {
		subquery = buildOrGroup(Dialect, where[i]);

		if (subquery !== false) {
			query.push(subquery);
		}
	}

	if (query.length === 0) {
		return [];
	} else if (query.length == 1) {
		return "WHERE " + query[0];
	}

	return "WHERE (" + query.join(") AND (") + ")";
};

function buildOrGroup(Dialect, where) {
	if (where.e) {
	    // EXISTS

	    wheres = [];
	    if(Array.isArray(where.e.l[0]) && Array.isArray(where.e.l[1])) {
	        for (i = 0; i < where.e.l[0].length; i++) {
	            wheres.push(Dialect.escapeId(where.e.l[0][i]) + " = " + Dialect.escapeId(where.e.tl, where.e.l[1][i]));
	        }
	    } else {
	        wheres.push(Dialect.escapeId(where.e.l[0]) + " = " + Dialect.escapeId(where.e.tl, where.e.l[1]));
	    }

		return [
			"EXISTS (" +
			"SELECT * FROM " + Dialect.escapeId(where.e.t) + " " +
			"WHERE " + wheres.join(" AND ") + " " +
			"AND " + buildOrGroup(Dialect, { t: null, w: where.w }) +
            ")"
		];
	}

	var query = [], op;

	for (var k in where.w) {
		if (where.w[k] === null || where.w[k] === undefined) {
			query.push(
				buildComparisonKey(Dialect, where.t, k) +
				" IS NULL"
			);
			continue;
		}
		// not is an alias for not_and
		if ([ "or", "and", "not_or", "not_and", "not" ].indexOf(k) >= 0) {
			var q, subquery = [];
			var prefix = (k == "not" || k.indexOf("_") >= 0 ? "NOT " : false);

			op = (k == "not" ? "and" : (k.indexOf("_") >= 0 ? k.substr(4) : k)).toUpperCase();

			for (var j = 0; j < where.w[k].length; j++) {
				q = buildOrGroup(Dialect, { t: where.t, w: where.w[k][j] });
				if (q !== false) {
					subquery.push(q);
				}
			}

			if (subquery.length > 0) {
				query.push((prefix ? prefix : "") + "((" + subquery.join(") " + op + " (") + "))");
			}
			continue;
		}

		if (typeof where.w[k].sql_comparator == "function") {
			op = where.w[k].sql_comparator();

			switch (op) {
				case "between":
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" BETWEEN " +
						Dialect.escapeVal(where.w[k].from) +
						" AND " +
						Dialect.escapeVal(where.w[k].to)
					);
					break;
				case "like":
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" LIKE " +
						Dialect.escapeVal(where.w[k].expr)
					);
					break;
				case "eq":
				case "ne":
				case "gt":
				case "gte":
				case "lt":
				case "lte":
					switch (op) {
						case "eq"  : op = (where.w[k].val === null ? "IS" : "="); break;
						case "ne"  : op = (where.w[k].val === null ? "IS NOT" : "<>"); break;
						case "gt"  : op = ">";  break;
						case "gte" : op = ">="; break;
						case "lt"  : op = "<";  break;
						case "lte" : op = "<="; break;
					}
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" " + op + " " +
						Dialect.escapeVal(where.w[k].val)
					);
					break;
				case "sql":
					if (typeof where.w[k].where == "object") {
						var sql = where.w[k].where.str.replace("?:column", buildComparisonKey(Dialect, where.t, k));

						sql = sql.replace(/\?:(id|value)/g, function (m) {
							if (where.w[k].where.escapes.length === 0) {
								return '';
							}

							if (m == "?:id") {
								return Dialect.escapeId(where.w[k].where.escapes.shift());
							}
							// ?:value
							return Dialect.escapeVal(where.w[k].where.escapes.shift());
						});

						query.push(sql);
					}
					break;
			}
			continue;
		}

		if (k == '__sql') {
			for (var a = 0; a < where.w[k].length; a++) {
				query.push(normalizeSqlConditions(Dialect, where.w[k][a]));
			}
		} else {
			query.push(
				buildComparisonKey(Dialect, where.t, k) +
				(Array.isArray(where.w[k]) ? " IN " : " = ") +
				Dialect.escapeVal(where.w[k])
			);
		}
	}

	if (query.length === 0) {
		return false;
	}

	return query.join(" AND ");
}

function buildComparisonKey(Dialect, table, column) {
	return (table ? Dialect.escapeId(table, column) : Dialect.escapeId(column));
}

// Transforms:
// ["name LIKE ? AND age > ?", ["John", 23]]
// into:
// "name LIKE 'John' AND age > 23"
function normalizeSqlConditions(Dialect, queryArray) {
	if (queryArray.length == 1) {
		return queryArray[0];
	}

	return queryArray[0].replace(/\?/g, function () {
		return Dialect.escapeVal(queryArray[1].shift());
	});
}
