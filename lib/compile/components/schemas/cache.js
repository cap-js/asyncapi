function cacheAndReturn(schemaCache, type, schema) {
    schemaCache[type] = schema

    return schema
}

function getCache(schemaCache, type) {
    // cache may not be mutated outside! -> clone
    return structuredClone(schemaCache[type])
}

module.exports = {
    cacheAndReturn,
    getCache
}
