exports.build = function (Dialect, where) {
	if (where.length === 0) {
		return [];
	}

	console.log("buildWhere", where);

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
		return [
			"EXISTS (" +
			"SELECT * FROM " + Dialect.escapeId(where.e.t) + " " +
			"WHERE " + Dialect.escapeId(where.e.l[0]) + " = " + Dialect.escapeId(where.e.tl, where.e.l[1]) + " " +
			"AND " + buildOrGroup(Dialect, [{ t: null, w: where.w }]) +
			")"
		];
	}

	var query = [];

	for (var k in where.w) {
		if (!where.w[k]) {
			query.push(
				buildComparisonKey(Dialect, where.t, k) +
				" IS NULL"
			);
			continue;
		}
		if ([ "or", "and" ].indexOf(k) >= 0) {
			var q, subquery = [];

			for (var j = 0; j < where.w[k].length; j++) {
				q = buildOrGroup(Dialect, { t: where.t, w: where.w[k][j] });
				if (q !== false) {
					subquery.push(q);
				}
			}

			if (subquery.length > 0) {
				query.push("((" + subquery.join(") " + k.toUpperCase() + " (") + "))");
			}
			continue;
		}
		if (typeof where.w[k].sql_comparator == "function") {
			var op = where.w[k].sql_comparator();

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
						case "eq"  : op = "=";  break;
						case "ne"  : op = "<>";  break;
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
			}
			continue;
		}

		query.push(
			buildComparisonKey(Dialect, where.t, k) +
			(Array.isArray(where.w[k]) ? " IN " : " = ") +
			Dialect.escapeVal(where.w[k])
		);
	}

	if (query.length === 0) {
		return false;
	}

	return query.join(" AND ");
}

function buildComparisonKey(Dialect, table, column) {
	return (table ? Dialect.escapeId(table, column) : Dialect.escapeId(column));
}
