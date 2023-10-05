import React from 'react';
import renderer from 'react-test-renderer';
import Item from './Item';

describe('Item', () => {
  it('renders correctly', () => {
    const data = {
      '@type': 'item',
      assetType: 'icon',
      icon: 'ri-home-line',
      iconSize: 'big',
      imageSize: 'big',
      verticalAlign: 'middle',
      description: 'some text',
    };

    const component = renderer.create(<Item {...data} />);
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
