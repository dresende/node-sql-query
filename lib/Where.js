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
			if (where[i].t === null) {
				query.push(
					Dialect.escapeId(k) +
					" = " +
					Dialect.escapeVal(where[i].w[k])
				);
			} else {
				query.push(
					Dialect.escapeId(where[i].t, k) +
					" = " +
					Dialect.escapeVal(where[i].w[k])
				);
			}
		}
	}

	return query.join(" AND ");
}
