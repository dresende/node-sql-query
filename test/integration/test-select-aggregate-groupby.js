var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').max('col1').groupBy('col1').build(),
	"SELECT MAX(`col1`) FROM `table1` GROUP BY `col1`"
);

assert.equal(
	common.Select().from('table1').avg().max('col1').groupBy('col1', '-col2').build(),
	"SELECT AVG(MAX(`col1`)) FROM `table1` GROUP BY `col1`, `col2` ORDER BY `col2` DESC"
);
