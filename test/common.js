var common = exports;
var Query  = require('../');

common.Query = Query;
common.Text  = Query.Text;

common.Select = function () {
	var q = new (Query.Query)();

	return q.select();
};
common.Create = function(){
    var q = new (Query.Query)();

    return q.create();
};
common.Insert = function () {
	var q = new (Query.Query)();

	return q.insert();
};

common.Update = function () {
	var q = new (Query.Query)();

	return q.update();
};

common.Remove = function () {
	var q = new (Query.Query)();

	return q.remove();
};

common.getDialect = function (dialect) {
	return require('../lib/Dialects/' + dialect);
};
