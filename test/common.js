var common = exports;
var Query  = require('../').Query;

common.Select = function () {
	var q = new Query();

	return q.select();
};

common.Insert = function () {
	var q = new Query();

	return q.insert();
};

common.Remove = function () {
	var q = new Query();

	return q.remove();
};

common.getDialect = function (dialect) {
	return require('../lib/Dialects/' + dialect);
};
