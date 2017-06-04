// @flow
import React from 'react';
import chunk from 'lodash/chunk';

type AttributeName = string;
type Attribute = [AttributeName, string];
type AttributeListProps = {
  attrs: Attribute[],
};

/**
 * Determine whether to show a pair of attributes.
 */
const BLACKLIST: Set<AttributeName> = new Set(['lang', 'dir', 'aria-label']);

const WHITELIST: Set<AttributeName> = new Set([
  'class',
  'id',
  'name',
  'value',
  'str',
  'href',
]);

const attributeFilter = ([name, _]: Attribute): boolean => {
  const isBlacklisted = BLACKLIST.has(name);

  if (isBlacklisted) {
    return false;
  }

  const isWhitelisted = WHITELIST.has(name);
  const isNotData = name.search(/^data-/) === -1;

  const keep = isWhitelisted || isNotData;
  return keep;
};

/**
 * Format class and id attributes with special
 * styles, rather than as key/value pairs.
 */
const ClassIdAttribute = ([name, value]: Attribute, i: number) => {
  const className = `Node__attr-value--${name}`;
  return (
    <li key={i}>
      <span className={className}>
        {value}
      </span>
    </li>
  );
};

/**
 * Format normal attributes as key/value pairs.
 */
const NormalAttribue = ([name, value]: Attribute, i: number) => (
  <li key={i}>
    <span className="Node__attr-name">
      {name}
    </span>
    <span className="Node__attr-value">
      {value}
    </span>
  </li>
);

/**
 * Generate the attribute list for some element in
 * the inspected subtree.
 */
const AttributeList = ({ attrs }: AttributeListProps) => {
  const attrList: Attribute[] = chunk(attrs, 2)
    .filter(attributeFilter)
    .map(
      ([name, value], i) =>
        (name === 'class' || name === 'id'
          ? ClassIdAttribute([name, value], i)
          : NormalAttribue([name, value], i))
    );

  return (
    <ul className="Node__attr-list">
      {attrList}
    </ul>
  );
};

export default AttributeList;
