function cacheAndReturn(schemaCache, type, schema) {
    // whoever passed in schema may mutate it by reference -> clone
    schemaCache[type] = structuredClone(schema)

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
