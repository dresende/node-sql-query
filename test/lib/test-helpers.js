var assert  = require('assert');
var Helpers = require('../../lib/Helpers');
var common  = require('../common');

var Dialect = common.getDialect('mysql');

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(`stuff`) LIKE 'peaches'"),
	"SELECT * FROM abc WHERE LOWER(`stuff`) LIKE 'peaches'"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(`stuff`) LIKE ?", ['peaches']),
	"SELECT * FROM abc WHERE LOWER(`stuff`) LIKE 'peaches'"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(`stuff`) LIKE ? AND `number` > ?", ['peaches', 12]),
	"SELECT * FROM abc WHERE LOWER(`stuff`) LIKE 'peaches' AND `number` > 12"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(`stuff`) LIKE ? AND `number` == ?", ['peaches']),
	"SELECT * FROM abc WHERE LOWER(`stuff`) LIKE 'peaches' AND `number` == NULL"
);
