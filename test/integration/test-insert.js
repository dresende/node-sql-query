var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Insert().into('table1').build(),
	"INSERT INTO `table1`"
);

assert.equal(
  common.Insert().into('table1').set({}).build(),
  "INSERT INTO `table1` VALUES()"
);

assert.equal(
	common.Insert().into('table1').set({ col: 1 }).build(),
	"INSERT INTO `table1` (`col`) VALUES (1)"
);

assert.equal(
	common.Insert().into('table1').set({ col1: 1, col2: 'a' }).build(),
	"INSERT INTO `table1` (`col1`, `col2`) VALUES (1, 'a')"
);
