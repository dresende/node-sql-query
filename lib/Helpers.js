
// Transforms:
// "name LIKE ? AND age > ?", ["John", 23]
// into:
// "name LIKE 'John' AND age > 23"
module.exports.escapeQuery = function (Dialect, query, args) {
	return query.replace(/\?/g, function () {
		return Dialect.escapeVal(args.shift());
	});
}
