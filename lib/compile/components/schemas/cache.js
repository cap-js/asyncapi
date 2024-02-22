function cacheAndReturn(schemaCache, type, schema) {
    schemaCache[type] = schema;

    return schema;
}

function getCache(schemaCache, type) {
    return schemaCache[type];
}

module.exports = {
    cacheAndReturn,
    getCache
}
