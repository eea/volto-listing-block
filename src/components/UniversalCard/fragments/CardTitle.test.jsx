import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardTitle from './CardTitle';

jest.mock(
  '@plone/volto/components/manage/ConditionalLink/ConditionalLink',
  () => ({
    __esModule: true,
    default: ({ children, condition, to }) => (
      <div
        data-testid="conditional-link"
        data-condition={condition}
        data-to={to}
      >
        {children}
      </div>
    ),
  }),
);

const itemModel = { hasLink: true, '@type': 'card' };

describe('CardTitle', () => {
  it('links to item.external_link when set', () => {
    render(
      <CardTitle
        item={{
          '@id': '/test-item',
          title: 'Test Item',
          external_link: 'https://example.org/agency',
        }}
        itemModel={itemModel}
      />,
    );

    expect(screen.getByTestId('conditional-link')).toHaveAttribute(
      'data-to',
      'https://example.org/agency',
    );
  });

  it('falls back to the item @id when external_link is not set', () => {
    render(
      <CardTitle
        item={{ '@id': '/test-item', title: 'Test Item' }}
        itemModel={itemModel}
      />,
    );

    expect(screen.getByTestId('conditional-link')).toHaveAttribute(
      'data-to',
      '/test-item',
    );
  });
});
