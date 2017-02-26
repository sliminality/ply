// @flow
import React, { Component } from 'react';
import { Parser, DomHandler } from 'htmlparser2';
import Codeblock from 'react-uikit-codeblock';
import TreeNode from '../../stories/TreeNode';
import './DOMExplorer.css';

const parserOpts = {
  withStartIndices: true,
  withEndIndices: true,
  normalizeWhitespace: true,
};

class DOMExplorer extends Component {
  props: {
    code: string,
  };

  constructor(props, context) {
    super(props, context);
    this._parse = this._parse.bind(this);
    this._handleParse = this._handleParse.bind(this);

    this.domHandler = new DomHandler(this._handleParse, parserOpts);
    this._parser = new Parser(this.domHandler);

    this.state = {
      parseError: null,
      ast: null,
    };
  }

  componentDidMount() {
    this._parse(this.props.code);
  }

  componentWillUnmount() {
    this.parser.done();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.code !== this.props.code) {
      this._parse(nextProps.code);
    }
    // May want to change focus here?
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.ast !== this.state.ast
      || nextState.parseError !== this.state.parseError
      || nextProps.code !== this.props.code;
  }

  _handleParse(err, ast) {
    if (err) {
      this.setState({ parseError: err });
    } else {
      this.setState({ ast: ast, parseError: null });
    }
  }

  _parse(code) {
    if (!this._parser) {
      return;
    }
    this._parser.parseComplete(code);
  }

  render() {
    let output;

    if (this.state.parseError) {
      output = (
        <div className="DOMExplorer__parse-error">
          {this.state.parseError.message}
        </div>
      );
    } else if (this.state.ast) {
      if (this.state.ast.length) {
        output =
          <TreeNode depth={0}
                    node={this.state.ast[0]}
                    isExpanded={true}
          />;
      }
    }

    return (
      <div className="DOMExplorer">
        <Codeblock>
          {output}
        </Codeblock>
      </div>
    );
  }
}

// DOMExplorer.propTypes = {
//   code: React.PropTypes.string.isRequired,
//   // parser: PropTypes.object.isRequired,
//   // parserSettings: PropTypes.object,
//   // cursor: PropTypes.any,
//   // onParseError: React.PropTypes.func.isRequired,
// };

export default DOMExplorer;
