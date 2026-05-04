const { addEnum } = require('./enum')
const schemaUtils = require('./utils')
const { cacheAndReturn, getCache } = require('./cache')
const { getOwnValue } = require('../../utils')
const { toLocalizedArray } = require('./localized')
const addAnnotations = require('./annotations')
const primitiveElementToSchema = require('./primitiveElement')
const getArrayOfType= require('./array')
const { followRefRecursive } = require('./ref')

function definitionToSchema(eventDefinition, definitions, schemaCache, i18nBundle) {
  const definition = definitions[eventDefinition]

  // For top-level events, skip description since it's on the message
  const skipDescription = definition.kind === 'event'

  if (schemaUtils.isStructured(definition)) {
    return addAnnotations(definition, elementsToSchema(schemaCache, definitions, definition, undefined, i18nBundle), i18nBundle, skipDescription)
  }

  return addAnnotations(definition, elementToSchema(schemaCache, definitions, definition, i18nBundle), i18nBundle, skipDescription)
}

function elementsToSchema(schemaCache, definitions, entry, nullable, i18nBundle) {
  if (!schemaUtils.isStructured(entry)) {
    return elementToSchema(schemaCache, definitions, entry, i18nBundle)
  }

  const required = []
  const object = schemaUtils.getBaseTypeStructure('object')
  for (const [name, element] of Object.entries(entry.elements)) {
    if (getOwnValue(element, 'key')
        || getOwnValue(element, '@mandatory')
        || (getOwnValue(element, '@Common.FieldControl') && getOwnValue(element['@Common.FieldControl'], '#') === 'Mandatory')
    ) {
      required.push(name)
    }

    if (!schemaUtils.elementIsRelevant(name, element)) {
      continue
    }

    if (!object.properties) {
      object.properties = {}
    }

    object.properties[name] = addAnnotations(element, elementToSchema(schemaCache, definitions, element, i18nBundle), i18nBundle)
  }

  if (required.length) {
    object.required = required
  }

  return object
}

function elementToSchema(schemaCache, definitions, entry, i18nBundle) {
  /*
   * Process reuse types as first step.
   * A structured type will be preprocessed and 'elements' will exists as inherited prototype.
   * If type is processed first, the reuse will be cached.
   * If the inherited elements would be processed instead, each reuse would process them again.
   */
  if (typeof entry.type === 'string' && definitions[entry.type]) {
    //  has been processed before
    if (schemaCache[entry.type]) {
      return getCache(schemaCache, entry.type)
    }

    return cacheAndReturn(schemaCache, entry.type,
      elementToSchema(schemaCache, definitions, definitions[entry.type], i18nBundle)
    )
  }

  // Process anonymous attribute object structures like "deep: {deeper: {attr: String;};};"
  if (schemaUtils.isStructured(entry)) {
    return elementsToSchema(schemaCache, definitions, entry, undefined, i18nBundle)
  }

  // Arrayed primitives and structured objects without keyed property
  if (schemaUtils.isManyEntry(entry)) {
    return manyToSchema(schemaCache, definitions, entry, i18nBundle)
  }

  // Definition > element references
  if (schemaUtils.isRefEntry(entry)) {
    return refToSchema(schemaCache, definitions, entry, i18nBundle)
  }

  // Associations to (root) entities and code lists
  if (schemaUtils.isAssociation(entry)) {
    return associationToSchema(schemaCache, definitions, entry, i18nBundle)
  }

  // Compositions of aspect or entity
  if (schemaUtils.isComposition(entry)) {
    return compositionToSchema(schemaCache, definitions, entry, i18nBundle)
  }

  //A localized element is a primitive at CSN and an array of objects at JSON schema (all translations)
  if (entry.localized === true) {
    return toLocalizedArray(entry)
  }

  const schema = addAnnotations(entry, primitiveElementToSchema(entry), i18nBundle)

  if (schemaUtils.isDefault(entry)) {
    schemaUtils.addDefaultValue(entry, schema)
  }

  if (schemaUtils.isEnum(entry)) {
    addEnum(entry, schema)
  }

  return schema
}

function associationToSchema(schemaCache, definitions, entry, i18nBundle) {
  let associationTargetDefinition = JSON.parse(JSON.stringify(definitions[entry.target]))
  Object.keys(associationTargetDefinition.elements).forEach(element => {
    if (associationTargetDefinition.elements[element].key === undefined) {
      delete associationTargetDefinition.elements[element]
    }
  })

  if (schemaUtils.isToManyAssociation(entry)) {
    return getArrayOfType(elementsToSchema(schemaCache, definitions, associationTargetDefinition, undefined, i18nBundle))
  } else {
    return elementsToSchema(schemaCache, definitions, associationTargetDefinition, undefined, i18nBundle)
  }
}

function manyToSchema(schemaCache, definitions, entry, i18nBundle) {
  return getArrayOfType(
    schemaUtils.isStructured(entry.items)
      ? elementsToSchema(schemaCache, definitions, entry.items, undefined, i18nBundle)
      : elementToSchema(schemaCache, definitions,
          // if entry.items.type can be found at definitions, it is a reuse type
          definitions[entry.items.type] ? definitions[entry.items.type] : (entry.items),
          i18nBundle
        )
  )
}

function compositionToSchema(schemaCache, definitions, entry, i18nBundle) {
  if (schemaUtils.isStructured(entry.targetAspect)) {
    const objectType = elementsToSchema(schemaCache, definitions, entry.targetAspect, undefined, i18nBundle)
    return schemaUtils.isToMany(entry) ? getArrayOfType(objectType) : objectType
  }
  // Composition of aspects might have a target towards a generated entity
  const target = entry.targetAspect || entry.target
  // An aspect is a reuse element, which might be used at more than one place with different cardinality
  const cacheKey = `${target}${schemaUtils.isToMany(entry) ? 'Many' : 'One'}`

  /*
   * Check if the target entity has been processed as association target before.
   */
  if (schemaCache[cacheKey]) {
    return getCache(schemaCache, cacheKey)
  }

  let objectType
  if (schemaUtils.isStructured(definitions[target])) {
    objectType = elementsToSchema(schemaCache, definitions, definitions[target], undefined, i18nBundle)
  } else {
    objectType = elementToSchema(schemaCache, definitions, target, i18nBundle)
  }

  return cacheAndReturn(schemaCache, cacheKey,
    schemaUtils.isToMany(entry) ? getArrayOfType(objectType) : objectType
  )
}

function refToSchema(schemaCache, definitions, entry, i18nBundle) {
  const refKey = entry.type.ref.join('.')

  if (schemaCache[refKey]) {
    return getCache(schemaCache, refKey)
  }

  return cacheAndReturn(
    schemaCache,
    refKey,
    elementToSchema(schemaCache, definitions, followRefRecursive(definitions, entry.type), i18nBundle)
  )
}

module.exports = {
  definitionToSchema,
  elementToSchema
}
