import React from 'react';
import { render, screen } from '@testing-library/react';
import { DefaultItemLayout } from './ItemTemplates';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/components', () => ({
  ConditionalLink: () => <div>ConditionalLink</div>,
  UniversalLink: () => <div>UniversalLink:</div>,
}));

describe('ItemTemplates', () => {
  const item = {
    title: 'Default listing title',
    description: 'Default listing description',
    meta: 'Default listing meta',
    EffectiveDate: '2023-10-05T08:21:00+02:00',
    url: '/my-item-url',
  };
  it('renders correctly', () => {
    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const { container } = render(
      <DefaultItemLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
      />,
    );

    const itemContainer = container.querySelector(
      '.u-item.listing-item.my-class',
    );
    expect(itemContainer).toBeInTheDocument();

    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Default listing title');
    expect(image).toHaveClass('ui image');

    expect(screen.getByText('ConditionalLink')).toBeInTheDocument();

    expect(screen.getByText('05 Oct 2023')).toHaveClass('listing-date');

    expect(screen.getByText('Default listing description')).toHaveClass(
      'listing-description',
    );
  });

  it('renders correctly without a description', () => {
    const itemModel = { hasImage: true, hasDate: true, hasDescription: false };

    render(<DefaultItemLayout item={item} itemModel={itemModel} />);

    expect(
      screen.queryByText('Default listing description'),
    ).not.toBeInTheDocument();
  });

  it('renders without an image if hasImage is false', () => {
    const itemModel = { hasImage: false, hasDate: true, hasDescription: true };

    const { container } = render(
      <DefaultItemLayout item={item} itemModel={itemModel} />,
    );

    expect(container.querySelector('.image-wrapper')).not.toBeInTheDocument();
  });

  it('renders with the image on the right when imageOnRightSide is true', () => {
    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: true,
    };

    const { container } = render(
      <DefaultItemLayout item={item} itemModel={itemModel} />,
    );

    const wrapper = container.querySelector('.wrapper');
    expect(wrapper).toHaveClass('right-image');

    const slotTop = container.querySelector('.slot-top');
    const bodyText = slotTop.querySelector('.listing-body');
    const imageWrapper = slotTop.querySelector('.image-wrapper');

    expect(bodyText).toBe(slotTop.firstChild);
    expect(imageWrapper).toBe(slotTop.lastChild);
  });
});
