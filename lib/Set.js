exports.build = function (Dialect, set) {
	if (!set || set.length === 0) {
		return [];
	}

	var query = [];

	for (var k in set) {
		query.push(
			Dialect.escapeId(k) +
			" = " +
			Dialect.escapeVal(set[k])
		);
	}

	return "SET " + query.join(", ");
};
