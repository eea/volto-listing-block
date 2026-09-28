import React from 'react';
import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DefaultCardLayout, ImageOnBottomCardLayout } from './CardTemplates';

jest.mock('@eeacms/volto-listing-block/components/UniversalCard', () => ({
  __esModule: true,
  CardDescription: () => <div data-testid="card-description" />,
  CardExtra: () => <div data-testid="card-extra" />,
  CardImage: () => <div data-testid="card-image" />,
  CardMeta: () => <div data-testid="card-meta" />,
  CardTitle: () => <div data-testid="card-title" />,
}));

const renderCard = (Layout, item) =>
  render(<Layout item={item} itemModel={{ hasLink: true }} />);

const item = { '@id': '/x', title: 'T' };

describe('DefaultCardLayout', () => {
  it.each([item, { ...item, external_link: 'https://example.org/agency' }])(
    'keeps the image on top',
    (data) => {
      const { container } = renderCard(DefaultCardLayout, data);
      const card = container.querySelector('.u-card');

      expect(card.firstElementChild).toHaveAttribute(
        'data-testid',
        'card-image',
      );
    },
  );
});

describe('ImageOnBottomCardLayout', () => {
  it('renders the title without meta or description above the image', () => {
    const { container } = renderCard(ImageOnBottomCardLayout, item);
    const card = container.querySelector('.u-card');

    expect(card.firstElementChild).toHaveClass('content');
    expect(card.children[1]).toHaveAttribute('data-testid', 'card-image');
    expect(within(card).queryByTestId('card-meta')).toBeNull();
    expect(within(card).queryByTestId('card-description')).toBeNull();
  });
});
