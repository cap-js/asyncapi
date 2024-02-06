const { getBaseTypeStructure } = require('./utils');

module.exports = function getArrayOfType(type) {
    const array = getBaseTypeStructure('array');
    array.items = type;

    return array;
}
