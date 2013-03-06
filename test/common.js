var common = exports;
var Query  = require('../').Query;

common.Select = function () {
	var q = new Query();

	return q.select();
};

common.getDialect = function (dialect) {
	return require('../lib/Dialects/' + dialect);
};
