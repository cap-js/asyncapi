const Examples = require('./examples');
const { getBaseTypeStructure, getFormatStructure, toString } = require('./utils');

module.exports = function primitiveElementToSchema(entry) {
    switch(entry.type) {
        case 'cds.Boolean':
            return getBaseTypeStructure("boolean");
        case 'cds.Integer':
            return getBaseTypeStructure("integer");
        case 'cds.Double':
            return getBaseTypeStructure("number");
        case 'cds.UUID':
            return getFormatStructure("uuid", Examples.UUID_EXAMPLE);
        case 'cds.Integer64':
            return getFormatStructure("int64", Examples.INT_64_EXAMPLE);
        case 'cds.Decimal': {
            let schema = getFormatStructure("decimal", Examples.DECIMAL_EXAMPLE);
            if (entry.precision) {
                schema['x-sap-precision'] = entry.precision;
            }
            if (entry.scale) {
                schema['x-sap-scale'] = entry.scale;
            }
            return schema;
        }
        case 'cds.Date':
            return getFormatStructure("date", Examples.DATE_EXAMPLE);
        case 'cds.Time':
            return getFormatStructure("partial-time", Examples.PARTIAL_TIME_EXAMPLE);
        case 'cds.DateTime':
        case 'cds.Timestamp':
            return getFormatStructure("date-time", Examples.DATE_TIME_EXAMPLE);
        case 'cds.String':
        case 'cds.LargeString':
        case 'cds.Binary':
        case 'cds.LargeBinary':
            return toString(entry);
        default:
            throw new Error(`Unsupported type ${entry.type}`);
    }
}
