exports.build = function (Dialect, set, opts) {
	opts = opts || {};
	
	if (!set || set.length === 0) {
		return [];
	}

	var query = [];

	for (var k in set) {
		query.push(
			Dialect.escapeId(k) +
			" = " +
			Dialect.escapeVal(set[k], opts.timezone)
		);
	}

	return "SET " + query.join(", ");
};
