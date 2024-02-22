const { isElements, isRefEntry } = require('./utils');

function followRefRecursive(definitions, ref) {
  const element = followRef(definitions, ref);

  if (isRefEntry(element)) {
    return followRefRecursive(definitions, element.type);
  }

  return element;
}

function followRef(definitions, { ref }) {
  const definition = definitions[ref[0]];

  if (!definition) {
    throw new Error(`Cannot find definition '${ref[0]}'`);
  }

  if (!isElements(definition.elements)) {
    throw new Error(`'${ref[0]}' is not a structured type`);
  }

  let pointer = definition.elements;
  let element;

  // Navigate down to the last elements section
  for (let elementIndex = 1; elementIndex < ref.length; elementIndex++) {
    element = pointer[ref[elementIndex]];

    if (element && isElements(element.elements)) {
      pointer = element.elements;
    }
  }

  if (!element) {
    throw new Error(`Cannot resolve reference '${ref.join(':')}'`);
  }

  return element;
}

module.exports = {
  followRefRecursive
}
