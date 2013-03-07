var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').limit(123).build(),
	"SELECT * FROM `table1` LIMIT 123"
);

assert.equal(
	common.Select().from('table1').limit('123456789').build(),
	"SELECT * FROM `table1` LIMIT 123456789"
);
