import React from 'react';
import renderer from 'react-test-renderer';
import { SearchItemLayout } from './SearchItemTemplate';

describe('SearchItemTemplates', () => {
  it('renders correctly', () => {
    const item = {
      title: 'Search listing title',
      description: 'Search listing description',
      meta: 'Search listing meta',
      url: '/my-item-url',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const component = renderer.create(
      <SearchItemLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
