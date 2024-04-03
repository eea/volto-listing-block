import React from 'react';
import { render } from '@testing-library/react';
import {
  DefaultCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
  ImageCardLayout,
} from './CardTemplates';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/components', () => ({
  ConditionalLink: () => <div>ConditionalLink</div>,
  UniversalLink: () => <div>UniversalLink:</div>,
}));

describe('DefaultCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'DefaultCardLayout title',
      description: 'DefaultCardLayout description',
      meta: 'DefaultCardLayout meta',
      EffectiveDate: '2023-10-05T08:21:00+02:00',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const { container, getAllByText } = render(
      <DefaultCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );

    const card = container.querySelector('.ui.fluid.card.u-card.my-class');
    expect(card).not.toBeNull();

    const contentArea = card.querySelector('.content');
    expect(contentArea).not.toBeNull();

    const meta = contentArea.querySelector('.meta');
    expect(meta).not.toBeNull();

    expect(meta.querySelector('.date')).toHaveTextContent('05 Oct 2023');

    const header = contentArea.querySelector('.header');
    expect(header).not.toBeNull();

    const conditionalLink = getAllByText('ConditionalLink');
    expect(conditionalLink).not.toBeNull();
  });
});

describe('LeftImageCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'LeftImageCardLayout title',
      description: 'LeftImageCardLayout description',
      meta: 'LeftImageCardLayout meta',
      EffectiveDate: '2023-10-05T08:21:00+02:00',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const { container, getAllByText } = render(
      <LeftImageCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );

    const card = container.querySelector(
      '.ui.fluid.card.u-card.my-class.item-card.left-image-card',
    );
    expect(card).not.toBeNull();

    const contentArea = card.querySelector('.content');
    expect(contentArea).not.toBeNull();

    const meta = contentArea.querySelector('.meta');
    expect(meta).not.toBeNull();

    expect(meta.querySelector('.date')).toHaveTextContent('05 Oct 2023');

    const header = contentArea.querySelector('.header');
    expect(header).not.toBeNull();

    const conditionalLink = getAllByText('ConditionalLink');
    expect(conditionalLink).not.toBeNull();
  });
});

describe('RightImageCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'RightImageCardLayout title',
      description: 'RightImageCardLayout description',
      meta: 'RightImageCardLayout meta',
      EffectiveDate: '2023-10-05T08:21:00+02:00',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const { container, getAllByText } = render(
      <RightImageCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );

    const card = container.querySelector(
      '.ui.fluid.card.u-card.my-class.item-card.right-image-card',
    );
    expect(card).not.toBeNull();

    const contentArea = card.querySelector('.content');
    expect(contentArea).not.toBeNull();

    const meta = contentArea.querySelector('.meta');
    expect(meta).not.toBeNull();

    expect(meta.querySelector('.date')).toHaveTextContent('05 Oct 2023');

    const header = contentArea.querySelector('.header');
    expect(header).not.toBeNull();

    const conditionalLink = getAllByText('ConditionalLink');
    expect(conditionalLink).not.toBeNull();
  });
});

describe('ImageCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'ImageCardLayout title',
      description: 'ImageCardLayout description',
      meta: 'ImageCardLayout meta',
      EffectiveDate: '2023-10-05T08:21:00+02:00',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const { container, getAllByText } = render(
      <ImageCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );

    const card = container.querySelector('.ui.fluid.card.u-card.my-class');
    expect(card).not.toBeNull();

    const conditionalLink = getAllByText('ConditionalLink');
    expect(conditionalLink).not.toBeNull();
  });
});
