exports.build = function (Dialect, where) {
	if (where.length === 0) {
		return [];
	}

	var query = [];

	for (var i = 0; i < where.length; i++) {
		var group = buildOrGroup(Dialect, where[i]);
		if (group !== false) {
			query.push(group);
		}
	}

	if (query.length === 0) {
		return [];
	}

	return "WHERE (" + query.join(") OR (") + ")";
};

function buildOrGroup(Dialect, where) {
	var query = [];

	for (var i = 0; i < where.length; i++) {
		if (where[i].e) {
			// EXISTS
			query.push(
				"EXISTS (" +
				"SELECT * FROM " + Dialect.escapeId(where[i].e.t) + " " +
				"WHERE " + Dialect.escapeId(where[i].e.l[0]) + " = " + Dialect.escapeId(where[i].e.tl, where[i].e.l[1]) + " " +
				"AND " + buildOrGroup(Dialect, [{ t: null, w: where[i].w }]) +
				")"
			);
			continue;
		}
		for (var k in where[i].w) {
			if (!where[i].w[k]) {
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

	if (query.length === 0) {
		return false;
	}

	return query.join(" AND ");
}

function buildComparisonKey(Dialect, table, column) {
	return (table ? Dialect.escapeId(table, column) : Dialect.escapeId(column));
}
