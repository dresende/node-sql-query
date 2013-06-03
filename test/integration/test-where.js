var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').where().build(),
	"SELECT * FROM `table1`"
);

assert.equal(
	common.Select().from('table1').where(null).build(),
	"SELECT * FROM `table1`"
);

assert.equal(
	common.Select().from('table1').where({ col: 1 }).build(),
	"SELECT * FROM `table1` WHERE `col` = 1"
);

assert.equal(
	common.Select().from('table1').where({ col: 0 }).build(),
	"SELECT * FROM `table1` WHERE `col` = 0"
);

assert.equal(
	common.Select().from('table1').where({ col: null }).build(),
	"SELECT * FROM `table1` WHERE `col` IS NULL"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.eq(null) }).build(),
	"SELECT * FROM `table1` WHERE `col` IS NULL"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.ne(null) }).build(),
	"SELECT * FROM `table1` WHERE `col` IS NOT NULL"
);

assert.equal(
	common.Select().from('table1').where({ col: undefined }).build(),
	"SELECT * FROM `table1` WHERE `col` IS NULL"
);

assert.equal(
	common.Select().from('table1').where({ col: false }).build(),
	"SELECT * FROM `table1` WHERE `col` = false"
);

assert.equal(
	common.Select().from('table1').where({ col: "" }).build(),
	"SELECT * FROM `table1` WHERE `col` = ''"
);

assert.equal(
	common.Select().from('table1').where({ col: true }).build(),
	"SELECT * FROM `table1` WHERE `col` = true"
);

assert.equal(
	common.Select().from('table1').where({ col: 'a' }).build(),
	"SELECT * FROM `table1` WHERE `col` = 'a'"
);

assert.equal(
	common.Select().from('table1').where({ col: 'a\'' }).build(),
	"SELECT * FROM `table1` WHERE `col` = 'a\\''"
);

assert.equal(
	common.Select().from('table1').where({ col: [ 1, 2, 3 ] }).build(),
	"SELECT * FROM `table1` WHERE `col` IN (1, 2, 3)"
);

assert.equal(
	common.Select().from('table1').where({ col1: 1, col2: 2 }).build(),
	"SELECT * FROM `table1` WHERE `col1` = 1 AND `col2` = 2"
);

assert.equal(
	common.Select().from('table1').where({ col1: 1 }, { col2: 2 }).build(),
	"SELECT * FROM `table1` WHERE (`col1` = 1) AND (`col2` = 2)"
);

assert.equal(
	common.Select().from('table1').where({ col: 1 }).where({ col: 2 }).build(),
	"SELECT * FROM `table1` WHERE (`col` = 1) AND (`col` = 2)"
);

assert.equal(
	common.Select().from('table1').where({ col1: 1, col2: 2 }).where({ col3: 3 }).build(),
	"SELECT * FROM `table1` WHERE (`col1` = 1 AND `col2` = 2) AND (`col3` = 3)"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id', 'id')
	               .where('table1', { col: 1 }, 'table2', { col: 2 }).build(),
	"SELECT * FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id` = `t1`.`id` WHERE (`t1`.`col` = 1) AND (`t2`.`col` = 2)"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id', 'id')
	               .where('table1', { col: 1 }, { col: 2 }).build(),
	"SELECT * FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id` = `t1`.`id` WHERE (`t1`.`col` = 1) AND (`col` = 2)"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.gt(1) }).build(),
	"SELECT * FROM `table1` WHERE `col` > 1"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.gte(1) }).build(),
	"SELECT * FROM `table1` WHERE `col` >= 1"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.lt(1) }).build(),
	"SELECT * FROM `table1` WHERE `col` < 1"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.lte(1) }).build(),
	"SELECT * FROM `table1` WHERE `col` <= 1"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.eq(1) }).build(),
	"SELECT * FROM `table1` WHERE `col` = 1"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.ne(1) }).build(),
	"SELECT * FROM `table1` WHERE `col` <> 1"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.between('a', 'b') }).build(),
	"SELECT * FROM `table1` WHERE `col` BETWEEN 'a' AND 'b'"
);

assert.equal(
	common.Select().from('table1').where({ col: common.Query.like('abc') }).build(),
	"SELECT * FROM `table1` WHERE `col` LIKE 'abc'"
);
