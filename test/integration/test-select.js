var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').build(),
	"SELECT * FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select('id', 'name').build(),
	"SELECT `id`, `name` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select('id', 'name').as('label').build(),
	"SELECT `id`, `name` AS `label` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select('id', 'name').select('title').as('label').build(),
	"SELECT `id`, `name`, `title` AS `label` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select('id', 'name').as('label').select('title').build(),
	"SELECT `id`, `name` AS `label`, `title` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select([ 'id', 'name' ]).build(),
	"SELECT `id`, `name` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select().build(),
	"SELECT * FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select(
		['abc','def', { a: 'ghi', sql: 'SOMEFUNC(ghi)' }]
	).build(),
	"SELECT `abc`, `def`, (SOMEFUNC(ghi)) AS `ghi` FROM `table1`"
);

assert.equal(
	common.Select().calculateFoundRows().from('table1').build(),
	"SELECT SQL_CALC_FOUND_ROWS * FROM `table1`"
);

assert.equal(
	common.Select().calculateFoundRows().from('table1').select('id').build(),
	"SELECT SQL_CALC_FOUND_ROWS `id` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').select('id1', 'name')
	               .from('table2', 'id2', 'id1').select('id2').build(),
	"SELECT `t1`.`id1`, `t1`.`name`, `t2`.`id2` FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1').select('id1', 'name')
	               .from('table2', 'id2', 'table1', 'id1').select('id2').build(),
	"SELECT `t1`.`id1`, `t1`.`name`, `t2`.`id2` FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id2', 'table1', 'id1').count().build(),
	"SELECT COUNT(*) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id2', 'table1', 'id1').count(null, 'c').build(),
	"SELECT COUNT(*) AS `c` FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id2', 'table1', 'id1').count('id').build(),
	"SELECT COUNT(`t2`.`id`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1').count('id')
	               .from('table2', 'id2', 'table1', 'id1').count('id').build(),
	"SELECT COUNT(`t1`.`id`), COUNT(`t2`.`id`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id2', 'table1', 'id1').count('id').count('col').build(),
	"SELECT COUNT(`t2`.`id`), COUNT(`t2`.`col`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1')
	               .from('table2', 'id2', 'table1', 'id1').fun('AVG', 'col').build(),
	"SELECT AVG(`t2`.`col`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
    common.Select().from('table1')
                   .from('table2',['id2a', 'id2b'], 'table1', ['id1a', 'id1b']).count('id').build(),
    "SELECT COUNT(`t2`.`id`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2a` = `t1`.`id1a` AND `t2`.`id2b` = `t1`.`id1b`"
);
