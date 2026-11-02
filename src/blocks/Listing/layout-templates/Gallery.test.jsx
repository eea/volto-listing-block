import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import Gallery from './Gallery';

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard',
  () => jest.fn(() => <div className="card" />),
);

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: { settings: { dateLocale: 'en' } },
}));

const mockStore = configureStore([]);

const renderGallery = (props) =>
  render(
    <Provider store={mockStore({ search: { subrequests: {} } })}>
      <Gallery block="b1" items={[{ '@id': '/a' }]} {...props} />
    </Provider>,
  );

describe('Gallery', () => {
  it('renders cards even when the saved model is a list item', () => {
    renderGallery({ itemModel: { '@type': 'item', imagePosition: 'left' } });
    expect(UniversalCard).toHaveBeenCalledWith(
      expect.objectContaining({
        itemModel: { '@type': 'card', imagePosition: 'top' },
      }),
      expect.anything(),
    );
  });
  beforeEach(() => UniversalCard.mockClear());

  it('renders the grid size', () => {
    const { container } = renderGallery({ gridSize: 'five' });
    expect(container.querySelector('.ui.fluid.five.cards')).toBeInTheDocument();
  });

  it('renders bordered cards as a table, without gaps', () => {
    const { container } = renderGallery({
      gridSize: 'four',
      itemModel: {
        '@type': 'card',
        imagePosition: 'top',
        styles: { 'border:noprefix': 'bordered' },
      },
    });
    expect(
      container.querySelector('.ui.fluid.four.cards.cards-table'),
    ).toBeInTheDocument();
  });

  it('keeps the gaps for the other borders', () => {
    ['no-border', 'top-accent'].forEach((border) => {
      const { container } = renderGallery({
        itemModel: {
          '@type': 'card',
          imagePosition: 'top',
          styles: { 'border:noprefix': border },
        },
      });
      expect(container.querySelector('.cards-table')).toBeNull();
    });
  });

  it('renders the former bordered toggle as a table', () => {
    const { container } = renderGallery({
      itemModel: {
        '@type': 'card',
        imagePosition: 'top',
        styles: { 'bordered:bool': true },
      },
    });
    expect(container.querySelector('.cards-table')).toBeInTheDocument();
  });

  it('passes the edit mode to the cards, so they do not navigate', () => {
    renderGallery({ isEditMode: true });
    expect(UniversalCard).toHaveBeenCalledWith(
      expect.objectContaining({ isEditMode: true }),
      expect.anything(),
    );
  });

  it('offers three to six columns', () => {
    const schema = Gallery.schemaEnhancer({
      schema: { fieldsets: [{ id: 'default', fields: [] }], properties: {} },
      intl: { formatMessage: ({ defaultMessage }) => defaultMessage },
    });
    expect(schema.properties.gridSize.choices.map(([value]) => value)).toEqual([
      'three',
      'four',
      'five',
      'six',
    ]);
  });
});
