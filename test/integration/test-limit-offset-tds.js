var common     = require('../common');
var assert     = require('assert');

assert.equal(
	common.Select('tds').from('table1').offset('123').limit('456').build(),
	"SELECT TOP 456 * FROM ( SELECT ROW_NUMBER() OVER (ORDER BY id ASC) AS p_RN, * FROM [table1] ) SQ WHERE p_RN > 123"
);

assert.equal(
	common.Select('tds').from('table1').offset('123').limit('456').order('col1').order('col2', 'Z').build(),
	"SELECT TOP 456 * FROM ( SELECT ROW_NUMBER() OVER (ORDER BY [col1] ASC, [col2] DESC) AS p_RN, * FROM [table1] ) SQ WHERE p_RN > 123 ORDER BY [col1] ASC, [col2] DESC"
);
