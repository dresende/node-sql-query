/**
 * To avoid escaping data
 */
module.exports = NoEscape;

function NoEscape(param) {
    
    this.unescapedParameter = param;
}

NoEscape.prototype.getUnescapedParam = function() {
    return this.unescapedParameter;
}