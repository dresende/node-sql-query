var common = exports;
var Query  = require('../').Query;

common.Select = function () {
	var q = new Query();

	return q.select();
};
