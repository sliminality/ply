// @flow @format
// eslint-disable no-use-before-define
import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import chunk from 'lodash/chunk';

import { mixins } from '../../styles';

type AttributeName = string;
type Attribute = [AttributeName, string];
type AttributeListProps = {
  attrs?: string[],
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
  const prefix = name === 'id' ? '#' : '.';
  return (
    <li key={i}>
      {value.split(' ').map((token, j) => (
        <span key={j} className={className}>
          {prefix}
          {token}
        </span>
      ))}
    </li>
  );
};

/**
 * Format normal attributes as key/value pairs.
 */
const NormalAttribute = ([name, value]: Attribute, i: number) => (
  <li key={i}>
    <span className={css(styles.clipboardOnly)}>[</span>
    <span className="Node__attr-name">{name}</span>
    {value && <span>="{value}"</span>}
    <span className={css(styles.clipboardOnly)}>]</span>
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
        name === 'class' || name === 'id'
          ? ClassIdAttribute([name, value], i)
          : NormalAttribute([name, value], i),
    );

  return <ul className="Node__attr-list">{attrList}</ul>;
};

const styles = StyleSheet.create({
  clipboardOnly: { ...mixins.clipboardOnly },
});

export default AttributeList;
