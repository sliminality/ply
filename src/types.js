// @flow @format
import type {
  CRDP$Node,
  CRDP$NodeId,
  CRDP$AttributeList,
} from 'devtools-typed/domain/DOM';
import type { CRDP$MatchedStyles } from 'devtools-typed/domain/CSS';
import type { Action } from './actions/types';
import type { CSSProperty } from './components/StyleViewer/types';

export type Dispatch = (action: Action) => any;

export type State = {
  connection: Connection,
  error: ?string,
  inspectionRoot: ?CRDP$NodeId,
  styles: NodeStyleMap,
  isPruning: boolean,
  pruned: NodeStyleMaskMap,
  dependencies: NodeStyleDependencies,
  selectedNodes: { [CRDP$NodeId]: boolean },
  entities: {
    // Output from Normalizr
    nodes?: NormalizedNodeMap,
  },
};

export type InspectorSettings = {
  inspectMultiple: boolean,
  showDevControls: boolean,
  deepExpandNodes: boolean,
};

// TODO: add this to main styles repo
export type ComputedStyle = { [CSSProperty]: string };

// TODO: figure out why the $Diff definition doesn't work
// export type NormalizedNode = $Diff<CRDP$Node, { children?: CRDP$Node[] }> & {
//   children?: CRDP$NodeId[],
// };
type CommonNodeProps = {|
  nodeId: CRDP$NodeId,
  parentId?: number,
  backendNodeId: CRDP$NodeId,
  nodeType: number,
  nodeName: string,
  localName: string,
  nodeValue: string,
  childNodeCount?: number,
  attributes?: CRDP$AttributeList,
  name?: string,
  pseudoType?: string,

  // Added properties
  offsetParent?: CRDP$NodeId,
|};

export type NormalizedNode = {|
  ...CommonNodeProps,
  pseudoElements?: CRDP$NodeId[],
  children?: CRDP$NodeId[],
|};

export type Connection = {
  targetConnected: boolean,
  connected: boolean,
  reconnecting: boolean,
};

export type NodeStyle = {
  nodeId: CRDP$NodeId,
  parentComputedStyle: ComputedStyle,
  computedStyle: ComputedStyle,
  ruleAnnotations?: Array<?CSSRuleAnnotation>,
} & CRDP$MatchedStyles;

export type NodeStyleMask = Array<Array<boolean>>;

export type NodeStyleMaskDiff = {
  enabled?: Array<CSSPropertyIndices>,
  disabled?: Array<CSSPropertyIndices>,
};

export type CSSPropertyIndices = [number, number, number];

export type NodeStyleMaskMap = { [CRDP$NodeId]: NodeStyleMask };

export type NodeStyleDependencies = {
  [keystone: CSSPropertyIndices]: Array<CSSPropertyIndices>,
};

export type CSSPropertyRelation =
  | 'FOCUSED'
  | 'DEPENDANT'
  | 'DEPENDANT_DISABLED';

// TODO(slim): Move this to shared type definitions repo.
export type CSSRuleAnnotation =
  // TODO: Add fields for the overriding rule index.
  { type: 'BASE_STYLE', shadowedProperties: Array<number> };

export type NodeStyleMap = { [CRDP$NodeId]: NodeStyle };
export type NormalizedNodeMap = { [CRDP$NodeId]: NormalizedNode };
