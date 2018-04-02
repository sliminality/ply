// @flow @format
import CSS_PROPERTIES from './cssProperties';

// Utility object for CSSProperty type definition.
// eslint-disable-next-line no-use-before-define
const cssProperties = (CSS_PROPERTIES: CSSPropertyData).reduce(
  ({ name }, acc) => ({ ...acc, [name]: name }),
  {},
);

export type CSSProperty = $Keys<typeof cssProperties>;

type CSSPropertyData = Array<{
  name: CSSProperty,
  longhands?: Array<string>,
  svg?: boolean,
  inherited?: boolean,
  defaultValue?: string,
}>;

export class CSSMetadata {
  _allProperties: Set<CSSProperty>;
  _allCanonical: Set<CSSProperty>;
  _inherited: Set<CSSProperty>;
  _longhands: Map<CSSProperty, Array<string>>;
  _defaults: Map<CSSProperty, string>;

  constructor(data: CSSPropertyData) {
    this._allProperties = new Set();
    this._allCanonical = new Set();
    this._inherited = new Set();
    this._longhands = new Map();
    this._defaults = new Map();

    for (const property of data) {
      const { name } = property;
      this._allProperties.add(name);

      const canonicalName = this.canonicalPropertyName(name);
      this._allCanonical.add(canonicalName);

      if (property.defaultValue) {
        this._defaults.set(name, property.defaultValue);
      }
      if (property.longhands) {
        this._longhands.set(name, property.longhands);
      }
      if (property.inherited) {
        this._inherited.add(name);
      }
    }
  }

  isValidProperty(name: CSSProperty): boolean {
    return this._allProperties.has(name);
  }

  isInherited(name: CSSProperty): boolean {
    return this._inherited.has(name);
  }

  longhandProperties(name: CSSProperty): ?Array<string> {
    return this._longhands.get(name);
  }

  canonicalPropertyName(name: CSSProperty): string {
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

  allProperties(): Set<CSSProperty> {
    return this._allProperties;
  }

  allCanonicalProperties(): Set<CSSProperty> {
    return this._allCanonical;
  }

  getDefault(name: CSSProperty): ?string {
    return this._defaults.get(name);
  }
}

const cssMetadata = new CSSMetadata(CSS_PROPERTIES);

export default cssMetadata;
