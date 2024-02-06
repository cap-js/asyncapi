
function toString(element) {
    let schema = getBaseTypeStructure("string");

    if ('length' in element && typeof element.length === 'number') {
        schema.maxLength = element.length;
    }

    return schema;
}

function getBaseTypeStructure(type) {
    return { type: type };
}

function getFormatStructure(format, example) {
    let schema = getBaseTypeStructure("string");

    schema.format = format;
    if (example) {
        schema.example = [example];
    }

    return schema;
}

function isAssociation(entry) {
    return !!entry && entry.type === 'cds.Association';
}

function isComposition(entry) {
    return !!entry && entry.type === 'cds.Composition';
}

function isStructured(entry) {
    return !!entry && typeof entry === 'object' && 'elements' in entry && isElements(entry.elements);
}

function isToMany(entry) {
    return entry.cardinality?.max === '*' || (typeof entry.cardinality?.max === 'number' && entry.cardinality?.max > 1);
}

function isDefault(entry) {
    return "default" in entry;
}

function isEnum(entry) {
    return "enum" in entry;
}

function addDefaultValue(entry, schema) {
    schema.default = entry.default.val;
}

function isVal(value) {
    return typeof value === 'object' && !!value && 'val' in value && Object.keys(value).length === 1;
}

function isElements(value) {
    return typeof value === 'object' && !!value && !Array.isArray(value) && !('=' in value) && !isVal(value);
}

function isManyEntry(entry) {
    return (
        'items' in entry &&
        typeof entry.items === 'object' &&
        !!entry.items &&
        (('type' in entry.items && typeof entry.items.type === 'string') ||
          ('elements' in entry.items && isElements(entry.items.elements)))
    );
}

function isLocalizedElement(name, element) {
    return (((name === 'texts' && isComposition(element)) || (name === 'localized' && isAssociation(element))) &&
        element.target.endsWith('.texts'));
}

function isToManyAssociation(entry) {
    return isAssociation(entry) && isToMany(entry);
}

function elementIsRelevant(name, element) {
    return !isLocalizedElement(name, element);
}

function isRefEntry(entry) {
    let type = entry.type;
    return typeof type === 'object' && !!type && 'ref' in type && Array.isArray(type.ref);
}

module.exports = {
    toString,
    getBaseTypeStructure,
    getFormatStructure,
    isAssociation,
    isComposition,
    isStructured,
    isToMany,
    isDefault,
    addDefaultValue,
    isEnum,
    isVal,
    elementIsRelevant,
    isManyEntry,
    isElements,
    isRefEntry,
    isToManyAssociation
}
