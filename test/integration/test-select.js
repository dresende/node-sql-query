var common     = require('../common');
var assert     = require('assert');

var Query = common.Select();

assert.equal(Query.from('table1').build(), "SELECT * FROM `table1`");
