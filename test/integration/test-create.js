var common     = require('../common');
var assert     = require('assert');

assert.equal(
    common.Create().table('table1').build(),
    "CREATE TABLE 'table1'()"
);

assert.equal(
    common.Create().table('table1').field('id','id').build(),
    "CREATE TABLE 'table1'('id' INTEGER PRIMARY KEY AUTO_INCREMENT)"
);

assert.equal(
    common.Create().table('table1').fields({id: 'id', a_text: 'text'}).build(),
    "CREATE TABLE 'table1'('id' INTEGER PRIMARY KEY AUTO_INCREMENT,'a_text' TEXT)"
);
assert.equal(
    common.Create().table('table1').fields({id: 'id', a_num: 'int'}).build(),
    "CREATE TABLE 'table1'('id' INTEGER PRIMARY KEY AUTO_INCREMENT,'a_num' INTEGER)"
);

assert.equal(
    common.Create().table('table1').fields({id: 'id', a_num: 'float'}).build(),
    "CREATE TABLE 'table1'('id' INTEGER PRIMARY KEY AUTO_INCREMENT,'a_num' FLOAT(12,2))"
);
assert.equal(
    common.Create().table('table1').fields({id: 'id', a_bool: 'bool'}).build(),
    "CREATE TABLE 'table1'('id' INTEGER PRIMARY KEY AUTO_INCREMENT,'a_bool' TINYINT(1))"
);