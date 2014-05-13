var assert  = require('assert');
var Helpers = require('../../lib/Helpers');
var common  = require('../common');

var Dialect = common.getDialect('mysql');

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches'"),
	"SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches'"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE ?", ['peaches']),
	"SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches'"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE ? AND `number` > ?", ['peaches', 12]),
	"SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches' AND `number` > 12"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE ? AND `number` == ?", ['peaches']),
	"SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches' AND `number` == NULL"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(abc.??) LIKE ? AND abc.?? > ?", ['stuff', 'peaches', 'number', 12]),
	"SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches' AND abc.`number` > 12"
);

assert.equal(
	Helpers.escapeQuery(Dialect, "SELECT * FROM abc WHERE LOWER(abc.??) LIKE ? AND ?? == ?", ['stuff', 'peaches', 'number']),
	"SELECT * FROM abc WHERE LOWER(abc.`stuff`) LIKE 'peaches' AND `number` == NULL"
);

// Should match at most 2 '?' at a time
assert.equal(
	Helpers.escapeQuery(Dialect, "?????", ['a', 'b', 'c']),
	"`a``b`'c'"
);

// Should not modify provided array
var arr = ['a', 'b', 'c'];
assert.equal(
	arr.join(','),
	'a,b,c'
)
