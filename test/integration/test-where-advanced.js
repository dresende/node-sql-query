var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').where({ or: [ { col: 1 }, { col: 2 } ] }).build(),
	"SELECT * FROM `table1` WHERE ((`col` = 1) OR (`col` = 2))"
);

assert.equal(
	common.Select().from('table1').where({ col: 1, or: [ { col: 2 }, { col: 3 } ] }).build(),
	"SELECT * FROM `table1` WHERE `col` = 1 AND ((`col` = 2) OR (`col` = 3))"
);
