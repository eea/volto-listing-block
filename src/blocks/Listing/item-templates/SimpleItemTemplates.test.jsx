import React from 'react';
import renderer from 'react-test-renderer';
import { SimpleItemLayout } from './SimpleItemTemplates';

jest.mock('@plone/volto/components', () => ({
  ConditionalLink: () => <div>ConditionalLink</div>,
}));

describe('SimpleItemTemplates', () => {
  it('renders correctly', () => {
    const item = {
      title: 'Simple listing title',
      description: 'Simple listing description',
      extra: 'Simple listing extra',
    };

    const itemModel = {
      '@type': 'Document',
    };

    const component = renderer.create(
      <SimpleItemLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
