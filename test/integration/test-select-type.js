var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select().from('table1').fun('myfun', 'col1').build(),
	"SELECT MYFUN(`col1`) FROM `table1`"
);

assert.equal(
	common.Select().from('table1').fun('myfun', [ 'col1', 'col2']).build(),
	"SELECT MYFUN(`col1`, `col2`) FROM `table1`"
);

assert.equal(
  common.Select().from('table1').fun('dbo.fnBalance', [ 80, null, null], 'balance').build(),
  "SELECT DBO.FNBALANCE(80, NULL, NULL) AS `balance` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').fun('myfun', [ 'col1', 'col2'], 'alias').build(),
	"SELECT MYFUN(`col1`, `col2`) AS `alias` FROM `table1`"
);

assert.equal(
	common.Select().from('table1').fun('myfun', [ 'col1', common.Text('col2') ], 'alias').build(),
	"SELECT MYFUN(`col1`, 'col2') AS `alias` FROM `table1`"
);
