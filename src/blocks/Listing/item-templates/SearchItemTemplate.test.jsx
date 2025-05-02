import React from 'react';
import { render } from '@testing-library/react';
import { SearchItemLayout } from './SearchItemTemplate';
import '@testing-library/jest-dom/extend-expect';

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

    const { container } = render(
      <SearchItemLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
      />,
    );

    const itemContainer = container.querySelector(
      '.u-item.listing-item.result-item.my-class',
    );
    const meta = itemContainer.querySelector('.slot-head');
    expect(meta).toHaveTextContent('Search listing meta');

    expect(container.querySelector('.listing-body')).toHaveTextContent(
      'Search listing title',
    );
    expect(container.querySelector('.listing-header')).toHaveTextContent(
      'Search listing title',
    );
    expect(container.querySelector('.listing-description')).toHaveTextContent(
      'Search listing description',
    );
  });
});
