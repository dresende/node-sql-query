var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').order('col').build(),
	"SELECT * FROM `table1` ORDER BY `col` ASC"
);

assert.equal(
	common.Select().from('table1').order('col', 'A').build(),
	"SELECT * FROM `table1` ORDER BY `col` ASC"
);

assert.equal(
	common.Select().from('table1').order('col', 'Z').build(),
	"SELECT * FROM `table1` ORDER BY `col` DESC"
);

assert.equal(
	common.Select().from('table1').order('col').order('col2', 'Z').build(),
	"SELECT * FROM `table1` ORDER BY `col` ASC, `col2` DESC"
);
