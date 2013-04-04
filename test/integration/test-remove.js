var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Remove().from('table1').build(),
	"DELETE FROM `table1`"
);

assert.equal(
	common.Remove().from('table1').where({ col: 1 }).build(),
	"DELETE FROM `table1` WHERE `col` = 1"
);

assert.equal(
	common.Remove().from('table1').where({ col1: 1 }, { col2: 2 }).build(),
	"DELETE FROM `table1` WHERE (`col1` = 1) AND (`col2` = 2)"
);

assert.equal(
	common.Remove().from('table1').where({ or: [{ col: 1 }, { col: 2 }] }).build(),
	"DELETE FROM `table1` WHERE ((`col` = 1) OR (`col` = 2))"
);
