// @flow @format
import CSS_PROPERTIES from './cssProperties';

type CSSPropertyData = Array<{
  name: string,
  longhands?: Array<string>,
  svg?: boolean,
  inherited?: boolean,
}>;

class CSSMetadata {
  _allProperties: Set<string>;
  _inherited: Set<string>;
  _longhands: Map<string, Array<string>>;

  constructor(data: CSSPropertyData) {
    this._allProperties = new Set();
    this._inherited = new Set();
    this._longhands = new Map();

    for (const property of data) {
      const { name } = property;
      this._allProperties.add(name);
      if (property.longhands) {
        this._longhands.set(name, property.longhands);
      }
      if (property.inherited) {
        this._inherited.add(name);
      }
    }
  }

  isValidProperty(property: string): boolean {
    return this._allProperties.has(property);
  }

  isInherited(property: string): boolean {
    return this._inherited.has(property);
  }

  longhandProperties(property: string): ?Array<string> {
    return this._longhands.get(property);
  }

  canonicalPropertyName(name: string): string {
    if (name.charAt(0) !== '-') {
      return name;
    }
    const matches = name.match(/(?:-webkit-)(.+)/);
    if (matches && matches.length > 1) {
      // eslint-disable-next-line no-unused-vars
      const [_, canonical] = matches;
      return canonical;
    } else {
      // NOTE: CDT also computes a set of property names for each style, and
      // checks whether `canonical` is in that set. We might want to do that.
      return name;
    }
  }
}

const cssMetadata = new CSSMetadata(CSS_PROPERTIES);

export default cssMetadata;
