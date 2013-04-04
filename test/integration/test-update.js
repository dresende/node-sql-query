var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Update().into('table1').build(),
	"UPDATE `table1`"
);

assert.equal(
	common.Update().into('table1').set({ col: 1 }).build(),
	"UPDATE `table1` SET `col` = 1"
);

assert.equal(
	common.Update().into('table1').set({ col1: 1, col2: 2 }).build(),
	"UPDATE `table1` SET `col1` = 1, `col2` = 2"
);

assert.equal(
	common.Update().into('table1').set({ col1: 1, col2: 2 }).where({ id: 3 }).build(),
	"UPDATE `table1` SET `col1` = 1, `col2` = 2 WHERE `id` = 3"
);
