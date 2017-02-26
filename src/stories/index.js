import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Button from './Button';
import Welcome from './Welcome';
import TreeNode from './TreeNode';

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')}/>
  ));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ));

const roots = [
  {
    attribs: { class: 'parent' },
    children: [
      {
        data: 'test',
        next: -1,
        parent: -1,
        prev: null,
        startIndex: 20,
        type: 'text',
      },
      {
        attribs: { class: 'child' },
        children: [{
          data: 'child div text here',
          next: null,
          parent: -1,
          prev: null,
          startIndex: 47,
          type: 'text',
        }],
        name: 'div',
        next: -1,
        parent: -1,
        prev: -1,
        startIndex: 28,
        type: 'tag',
      },
      {
        attribs: { src: 'foo.png', 'class': 'some-image' },
        children: [],
        name: 'img',
        next: -1,
        parent: -1,
        prev: -1,
        startIndex: 29,
        type: 'tag',
      },
      {
        data: '',
        next: null,
        parent: -1,
        prev: -1,
        startIndex: 104,
        type: 'text',
      },
    ],
    name: 'div',
    next: null,
    parent: null,
    prev: null,
    startIndex: 0,
    type: 'tag',
  }
];

storiesOf('TreeNode', module)
  .add('expanded', () => (
    <TreeNode node={roots[0]}
              depth={0}
              isExpanded={true}
    />
  ));
