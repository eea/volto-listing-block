import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DefaultCardLayout } from './CardTemplates';

jest.mock('@eeacms/volto-listing-block/components/UniversalCard', () => ({
  __esModule: true,
  CardDescription: () => <div data-testid="card-description" />,
  CardExtra: () => <div data-testid="card-extra" />,
  CardImage: () => <div data-testid="card-image" />,
  CardMeta: () => <div data-testid="card-meta" />,
  CardTitle: () => <div data-testid="card-title" />,
}));

const renderCard = (item) =>
  render(<DefaultCardLayout item={item} itemModel={{ hasLink: true }} />);

describe('DefaultCardLayout with an external link', () => {
  it('keeps the image on top by default', () => {
    const { container } = renderCard({ '@id': '/x', title: 'T' });
    const card = container.querySelector('.u-card');

    expect(card.firstElementChild).toHaveAttribute('data-testid', 'card-image');
  });

  it('renders the title above the linked image when external_link is set', () => {
    const { container } = renderCard({
      '@id': '/x',
      title: 'T',
      external_link: 'https://example.org/agency',
    });
    const card = container.querySelector('.u-card');

    expect(card.firstElementChild).toHaveClass('content');
    expect(card.children[1]).toHaveAttribute('data-testid', 'card-image');
  });
});
