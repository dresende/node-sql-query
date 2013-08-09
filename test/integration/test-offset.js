var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').offset(3).build(),
	"SELECT * FROM `table1` OFFSET 3"
);

assert.equal(
	common.Select('tds').from('table1').offset(3).build(),
	"SELECT * FROM ( SELECT ROW_NUMBER() OVER (ORDER BY id ASC) AS p_RN, * FROM [table1] ) SQ WHERE p_RN > 3"
);

assert.equal(
	common.Select().from('table1').offset('123456789').build(),
	"SELECT * FROM `table1` OFFSET 123456789"
);

assert.equal(
	common.Select('tds').from('table1').offset('123456789').build(),
	"SELECT * FROM ( SELECT ROW_NUMBER() OVER (ORDER BY id ASC) AS p_RN, * FROM [table1] ) SQ WHERE p_RN > 123456789"
);
