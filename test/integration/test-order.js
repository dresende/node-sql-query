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

assert.equal(
	common.Select().from('table1').order('col', []).build(),
	"SELECT * FROM `table1` ORDER BY col"
);

assert.equal(
	common.Select().from('table1').order('?? DESC', ['col']).build(),
	"SELECT * FROM `table1` ORDER BY `col` DESC"
);

assert.equal(
	common.Select().from('table1').order('ST_Distance(??, ST_GeomFromText(?,4326))', ['geopoint', 'POINT(-68.3394 27.5578)']).build(),
	"SELECT * FROM `table1` ORDER BY ST_Distance(`geopoint`, ST_GeomFromText('POINT(-68.3394 27.5578)',4326))"
);
