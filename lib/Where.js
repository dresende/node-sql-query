exports.build = function (Dialect, where) {
	if (where.length === 0) {
		return [];
	}

	var query = [];

	for (var i = 0; i < where.length; i++) {
		query.push(buildOrGroup(Dialect, where[i]));
	}

	return "WHERE (" + query.join(") OR (") + ")";
};

function buildOrGroup(Dialect, where) {
	var query = [];

	for (var i = 0; i < where.length; i++) {
		for (var k in where[i].w) {
			if (where[i].w[k] === null) {
				query.push(
					buildComparisonKey(Dialect, where[i].t, k) +
					" IS NULL"
				);
				continue;
			}
			if (typeof where[i].w[k].sql_comparator == "function") {
				var op = where[i].w[k].sql_comparator();

				switch (op) {
					case "between":
						query.push(
							buildComparisonKey(Dialect, where[i].t, k) +
							" BETWEEN " +
							Dialect.escapeVal(where[i].w[k].from) +
							" AND " +
							Dialect.escapeVal(where[i].w[k].to)
						);
						break;
					case "like":
						query.push(
							buildComparisonKey(Dialect, where[i].t, k) +
							" LIKE " +
							Dialect.escapeVal(where[i].w[k].expr)
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
							buildComparisonKey(Dialect, where[i].t, k) +
							" " + op + " " +
							Dialect.escapeVal(where[i].w[k].val)
						);
						break;
				}
				continue;
			}

			query.push(
				buildComparisonKey(Dialect, where[i].t, k) +
				(Array.isArray(where[i].w[k]) ? " IN " : " = ") +
				Dialect.escapeVal(where[i].w[k])
			);
		}
	}

	return query.join(" AND ");
}

function buildComparisonKey(Dialect, table, column) {
	return (table ? Dialect.escapeId(table, column) : Dialect.escapeId(column));
}
