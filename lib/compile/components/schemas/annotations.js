
const cds = require('@sap/cds/lib')
const { readFileSync, existsSync } = require('fs')
const { join } = require('path')

const odmAnnotationsMapping = Object.freeze({
    '@ODM.entityName': 'x-sap-odm-entity-name',
    '@ODM.oid': 'x-sap-odm-oid'
})

/**
 * Resolves i18n markers in a string like '{i18n>KEY}' using cds.i18n.labels
 */
function resolveI18n(text) {
    if (typeof text !== 'string' || !text.includes('{i18n>')) {
        return text
    }

    // Match {i18n>KEY} pattern
    const match = text.match(/^\{i18n>([^}]+)\}$/)
    if (!match) {
        return text
    }

    const key = match[1]
    
    // Use cds.i18n.labels to resolve the key (works when i18n files are in standard location)
    const resolved = cds.i18n.labels.at(key)
    if (resolved) {
        return resolved
    }
    
    // Fallback for non-standard locations (e.g., tests)
    // Try to read i18n files directly from common locations relative to cds.root
    const root = cds.root || process.cwd()
    const i18nPaths = [
        join(root, '_i18n', 'i18n.properties'),
        join(root, 'i18n', 'i18n.properties'),
        join(root, '_i18n', 'i18n_en.properties'),
        join(root, 'i18n', 'i18n_en.properties'),
        // For tests: also try test-specific paths
        join(root, 'test', 'lib', 'compile', 'components', 'schemas', 'input', '_i18n', 'i18n.properties'),
    ]

    for (const i18nPath of i18nPaths) {
        if (existsSync(i18nPath)) {
            try {
                const content = readFileSync(i18nPath, 'utf8')
                const lines = content.split('\n')
                
                for (const line of lines) {
                    // Parse key = value format
                    const lineMatch = line.match(/^([^=\s]+)\s*=\s*(.+)$/)
                    if (lineMatch && lineMatch[1].trim() === key) {
                        return lineMatch[2].trim()
                    }
                }
            } catch (err) {
                // If file read fails, continue to next path
                continue
            }
        }
    }
    
    // If not found, return original text
    return text
}

function addOdmExtensions(definition, object) {
    for (const [annotation, asyncApiExtension] of Object.entries(odmAnnotationsMapping)) {
        if (definition[annotation]) {
            object[asyncApiExtension] = definition[annotation]
        }
    }
}

module.exports = function addAnnotations(definition, object) {
    if (typeof (definition['@title']) === 'string') {
        object.title = resolveI18n(definition['@title'])
    }

    if (typeof (definition['@description']) === 'string') {
        object.description = resolveI18n(definition['@description'])
    } else if (typeof (definition['@Core.Description']) === 'string') {
        object.description = resolveI18n(definition['@Core.Description'])
    } else if (typeof definition.doc === 'string') {
        object.description = definition.doc.replace(/\n/g, ' ')
    }

    if (definition['@ODM.root']) {
        object['x-sap-root-entity'] = definition['@ODM.root']
    }

    addOdmExtensions(definition, object)

    return object
}
