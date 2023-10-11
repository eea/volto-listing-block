import React from 'react';
import renderer from 'react-test-renderer';
import { DefaultItemLayout } from './ItemTemplates';

jest.mock('@plone/volto/components', () => ({
  ConditionalLink: () => <div>ConditionalLink</div>,
  UniversalLink: () => <div>UniversalLink:</div>,
}));

describe('ItemTemplates', () => {
  it('renders correctly', () => {
    const item = {
      title: 'Default listing title',
      description: 'Default listing description',
      meta: 'Default listing meta',
      EffectiveDate: '2023-10-05T08:21:00+02:00',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const component = renderer.create(
      <DefaultItemLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
