// @flow @format
import type { NodeStyleMask } from './types';

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
