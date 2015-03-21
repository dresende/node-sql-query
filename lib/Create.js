exports.CreateQuery = CreateQuery;

/**
 * Really lightweight templating
 * @param template
 * @param args
 * @returns {string}
 */
var tmpl = function (template, args) {
	var has = {}.hasOwnProperty;
	for (var key in args) {
		if (!has.call(args, key)) {
			continue;
		}
		var token = '{{' + key + '}}';
		template = template.split(token).join(args[key]);
	}

	return template;
};
/**
 * Builds a list of fields according to the used dialect
 * @param dialect
 * @param structure
 * @returns {string}
 */
var buildFieldsList = function (dialect, structure) {
	if (!structure) {
		return "";
	}
	var tpl = "'{{NAME}}' {{TYPE}}", fields = [], has = {}.hasOwnProperty;
	for (var field in structure) {
		if (has.call(structure, field)) {
			fields.push(tmpl(tpl, {
				NAME: field,
				TYPE: dialect.DataTypes[structure[field]]
			}));
		}
	}

	return fields.join(',');
};

/**
 * Instantiate a new CREATE-type query builder
 * @param Dialect
 * @param opts
 * @returns {{table: table, field: field, fields: fields, build: build}}
 * @constructor
 */
function CreateQuery(Dialect, opts) {
	var sql = {};
	var tableName = null;
	var structure = {};

	return {
		/**
		 * Set the table name
		 * @param table_name
		 * @returns {*}
		 */
		table: function (table_name) {
			tableName = table_name;

			return this;
		},
		/**
		 * Add a field
		 * @param name
		 * @param type
		 * @returns {Object}
		 */
		field: function (name, type) {
			structure[name] = type;

			return this;
		},
		/**
		 * Set all the fields
		 * @param fields
		 * @returns {Object}
		 */
		fields: function (fields) {
			if (!fields) {
				return structure;
			}
			structure = fields;

			return this;
		},

		/**
		 * Build a query from the passed params
		 * @returns {string}
		 */
		build: function () {
			var query, fieldsList, template = "CREATE TABLE '{{TABLE_NAME}}'({{FIELDS_LIST}})";

			if(!tableName){
				return '';
			}

			fieldsList = buildFieldsList(Dialect, structure);

			return tmpl(template, {
				TABLE_NAME: tableName,
				FIELDS_LIST: fieldsList
			});

		}
	};
}
