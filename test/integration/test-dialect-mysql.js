var common     = require('../common');
var assert     = require('assert');
var dialect    = common.getDialect('mysql');

assert.equal(
	dialect.escapeId('col'),
	"`col`"
);

assert.equal(
	dialect.escapeId('table', 'col'),
	"`table`.`col`"
);

assert.equal(
	dialect.escapeId('table', 'co`l'),
	"`table`.`co``l`"
);

assert.equal(
	dialect.escapeVal(undefined),
	'NULL'
);

assert.equal(
	dialect.escapeVal(null),
	'NULL'
);

assert.equal(
	dialect.escapeVal(123),
	"123"
);

assert.equal(
	dialect.escapeVal(NaN),
	"'NaN'"
);

assert.equal(
	dialect.escapeVal(Infinity),
	"'Infinity'"
);

assert.equal(
	dialect.escapeVal('abc'),
	"'abc'"
);

assert.equal(
	dialect.escapeVal('ab\'c'),
	"'ab\\'c'"
);

assert.equal(
	dialect.escapeVal([ 1, 'abc', 'a\'' ]),
	"(1, 'abc', 'a\\'')"
);

assert.equal(
	dialect.escapeVal(true),
	"true"
);

assert.equal(
	dialect.escapeVal(false),
	"false"
);


// Dates and Timezones
var d = new Date(1378322111133);
var tzOffsetMillis = (d.getTimezoneOffset() * 60 * 1000);

assert.equal(
	dialect.escapeVal(new Date(d.getTime() + tzOffsetMillis)),
	"'2013-09-04 19:15:11'"
);
assert.equal(
	dialect.escapeVal(new Date(d.getTime()), 'Z'),
	"'2013-09-04 19:15:11'"
);
assert.equal(
	dialect.escapeVal(new Date(d.getTime()), '-0000'),
	"'2013-09-04 19:15:11'"
);
assert.equal(
	dialect.escapeVal(new Date(d.getTime()), '-0400'),
	"'2013-09-04 15:15:11'"
);
assert.equal(
	dialect.escapeVal(new Date(d.getTime())),
	dialect.escapeVal(new Date(d.getTime()), 'local')
);
