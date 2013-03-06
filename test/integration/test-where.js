var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('t1').where({ col: 1 }).build(),
	"SELECT * FROM `t1` WHERE (`col` = 1)"
);

assert.equal(
	common.Select().from('t1').where({ col: 'a' }).build(),
	"SELECT * FROM `t1` WHERE (`col` = 'a')"
);

assert.equal(
	common.Select().from('t1').where({ col: 'a\'' }).build(),
	"SELECT * FROM `t1` WHERE (`col` = 'a\\'')"
);

assert.equal(
	common.Select().from('t1').where({ col1: 1, col2: 2 }).build(),
	"SELECT * FROM `t1` WHERE (`col1` = 1 AND `col2` = 2)"
);

assert.equal(
	common.Select().from('t1').where({ col1: 1 }, { col2: 2 }).build(),
	"SELECT * FROM `t1` WHERE (`col1` = 1 AND `col2` = 2)"
);

assert.equal(
	common.Select().from('t1').where({ col: 1 }).where({ col: 2 }).build(),
	"SELECT * FROM `t1` WHERE (`col` = 1) OR (`col` = 2)"
);
