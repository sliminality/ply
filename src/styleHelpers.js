// @flow @format
import cssMetadata from './metadata';
import flatten from 'lodash/flatten';

import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';
import type {
  CRDP$CSSProperty,
  CRDP$RuleMatch,
} from 'devtools-typed/domain/CSS';
import type { NodeStyleMask, CSSPropertyIndices } from './types';

export const isPropertyActiveInMask = (mask: NodeStyleMask) => (
  ruleIndex: number,
) => (propertyIndex: number): boolean => {
  const rule = mask[ruleIndex];
  if (!Array.isArray(rule)) {
    return false;
  }
  const property = rule[propertyIndex];
  if (typeof property !== 'boolean') {
    return false;
  }
  return property;
};

export const indicesEqual = (a: CSSPropertyIndices) => (
  b: CSSPropertyIndices,
) => {
  const [nodeA, ruleA, propertyA] = a;
  const [nodeB, ruleB, propertyB] = b;
  return nodeA === nodeB && ruleA === ruleB && propertyA === propertyB;
};

export const toInt = (nodeId: CRDP$NodeId) => parseInt(nodeId, 10);

export const getEffectiveValueForProperty = (
  nodeId: CRDP$NodeId,
  rm: Array<CRDP$RuleMatch>,
) => (propertyName: string): Array<CSSPropertyIndices> => {
  const effectiveProperties: {
    [property: string]: Array<CSSPropertyIndices>,
  } = {};

  for (const [ruleIndex, { rule }] of rm.entries()) {
    const { style } = rule;
    const { cssProperties } = style;

    if (rule.origin !== 'regular') {
      continue;
    }

    for (const [propertyIndex, property] of cssProperties.entries()) {
      // Disabled properties can't be effective.
      // TODO: also check for properties without a SourceRange (logic is already in
      // background.js somewhere)
      if (property.disabled) {
        continue;
      }

      const { name } = property;
      const indices: CSSPropertyIndices = [
        toInt(nodeId),
        ruleIndex,
        propertyIndex,
      ];
      const canonicalName = cssMetadata.canonicalPropertyName(name);
      const longhands = cssMetadata.longhandProperties(canonicalName);

      if (longhands && longhands.length > 0) {
        // Check each longhand, e.g. `margin-left`, `margin-right`, etc.
        // To see if it has an active property.
        longhands.forEach(lh => {
          if (!effectiveProperties[lh]) {
            effectiveProperties[lh] = [indices];
          }
        });

        // Map the shorthand to each of the longhands.
        // TODO: Check implemented??
        // TODO: This is definitely going to fail if we set a shorthand first and
        // then subsequently overwrite with `margin-left: 10px` or something
        effectiveProperties[canonicalName] = flatten(
          longhands.map(lh => effectiveProperties[lh]).filter(Boolean),
        );
      } else {
        // Property does not have longhands.
        // If the property has not yet been found, record it.
        if (!effectiveProperties[canonicalName]) {
          effectiveProperties[canonicalName] = [indices];
        }
      }
    }
  }

  const canonicalName = cssMetadata.canonicalPropertyName(propertyName);
  const longhands = cssMetadata.longhandProperties(canonicalName);
  const query = longhands || [canonicalName];
  const result = flatten(
    query.map(prop => effectiveProperties[prop]).filter(Boolean),
  );

  return result;
};
