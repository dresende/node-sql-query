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

assert.equal(
	common.Remove().from('table1').limit(10).build(),
	"DELETE FROM `table1` LIMIT 10"
);

assert.equal(
	common.Remove().from('table1').limit(10).offset(3).build(),
	"DELETE FROM `table1` LIMIT 10 OFFSET 3"
);

assert.equal(
	common.Remove().from('table1').order('col').limit(5).build(),
	"DELETE FROM `table1` ORDER BY `col` ASC LIMIT 5"
);

assert.equal(
	common.Remove().from('table1').order('col1', 'A').order('col2', 'Z').limit(5).build(),
	"DELETE FROM `table1` ORDER BY `col1` ASC, `col2` DESC LIMIT 5"
);
