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
	common.Select().from('table1').select('id1', 'name')
	               .from('table2', 'id2', 'id1').select('id2').build(),
	"SELECT `t1`.`id1`, `t1`.`name`, `t2`.`id2` FROM `table1` AS `t1` JOIN `table2` AS `t2` ON `t2`.`id2` = `t1`.`id1`"
);

assert.equal(
	common.Select().from('table1').select('id1', 'name')
	               .from('table2', 'id2', 'table1', 'id1').select('id2').build(),
	"SELECT `t1`.`id1`, `t1`.`name`, `t2`.`id2` FROM `table1` AS `t1` JOIN `table2` AS `t2` ON `t2`.`id2` = `t1`.`id1`"
);
