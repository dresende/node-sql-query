var common = exports;
var Query  = require('../');

common.Query = Query;
common.Text  = Query.Text;

common.Select = function (dialect) {
	var q = new (Query.Query)(dialect);

	return q.select();
};

common.Insert = function (dialect) {
	var q = new (Query.Query)(dialect);

	return q.insert();
};

common.Update = function (dialect) {
	var q = new (Query.Query)(dialect);

	return q.update();
};

common.Remove = function (dialect) {
	var q = new (Query.Query)(dialect);

	return q.remove();
};

common.getDialect = function (dialect) {
	return require('../lib/Dialects/' + dialect);
};
