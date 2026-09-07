import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import config from '@plone/volto/registry';
import UniversalCard from './UniversalCard';
import {
  DefaultCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
  ImageCardLayout,
} from '../../blocks/Listing/item-templates/CardTemplates';
import VisualizationCard from '../../blocks/Listing/item-templates/VisualizationCard';
import { DefaultItemLayout } from '../../blocks/Listing/item-templates/ItemTemplates';
import { SearchItemLayout } from '../../blocks/Listing/item-templates/SearchItemTemplate';
import { SimpleItemLayout } from '../../blocks/Listing/item-templates/SimpleItemTemplates';

jest.mock('./schema', () => jest.fn());
jest.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  buildStyleClassNamesFromData: () => [],
}));
jest.mock('@eeacms/volto-listing-block/PreviewImage', () => ({ item }) => (
  <img src="/preview.png" alt={item.title} />
));
jest.mock('./fragments/RenderBlocksWrapper', () => ({ location }) => (
  <div data-testid="popup-content">{location.pathname}</div>
));

const variants = [
  ['card', DefaultCardLayout],
  ['imageOnLeft', LeftImageCardLayout],
  ['imageOnRight', RightImageCardLayout],
  ['imageCard', ImageCardLayout],
  ['visualizationCard', VisualizationCard],
  ['item', DefaultItemLayout],
  ['searchItem', SearchItemLayout],
  ['simpleItem', SimpleItemLayout],
];
const mockStore = configureStore([]);

beforeEach(() => {
  config.blocks.blocksConfig.listing = {
    extensions: {
      cardTemplates: variants.map(([id, template]) => ({
        id,
        template,
        isDefault: id === 'card',
      })),
    },
  };
});

const renderCard = (variant, options = {}) =>
  render(
    <Provider
      store={mockStore({
        screen: { width: options.width || 1920 },
        vocabularies: {},
      })}
    >
      <UniversalCard
        item={{ '@id': '/example', title: 'Example card' }}
        isEditMode={options.edit}
        itemModel={{
          '@type': variant,
          hasImage: true,
          hasDate: false,
          titleOnImage: variant === 'imageCard',
          enableCTAPopup: options.popup,
          callToAction: {
            enable: true,
            label: 'Read more',
            urlTemplate: '$URL/details',
          },
        }}
      />
    </Provider>,
  );

describe.each(variants.map(([id]) => [id]))('%s actions', (variant) => {
  it('links the title and available preview to the CTA destination', () => {
    renderCard(variant);
    expect(screen.getByText('Example card').closest('a')).toHaveAttribute(
      'href',
      '/example/details',
    );
    if (variant !== 'simpleItem') {
      expect(screen.getByRole('img').closest('a')).toHaveAttribute(
        'href',
        '/example/details',
      );
    }
    const cta = screen.queryByText('Read more');
    if (cta) expect(cta).toHaveAttribute('href', '/example/details');
  });

  it.each(['title', 'image'])(
    'uses the shared popup from the %s',
    (trigger) => {
      if (trigger === 'image' && variant === 'simpleItem') return;
      renderCard(variant, { popup: true });
      fireEvent.click(
        trigger === 'title'
          ? screen.getByText('Example card')
          : screen.getByRole('img'),
      );
      expect(screen.getAllByTestId('popup-content')).toHaveLength(1);
      expect(screen.getByTestId('popup-content')).toHaveTextContent(
        '/example/details',
      );
    },
  );

  it('keeps card links inactive while editing', () => {
    renderCard(variant, { popup: true, edit: true });
    expect(screen.getByText('Example card').closest('a')).toBeNull();
    const image = screen.queryByRole('img');
    if (image) expect(image.closest('a')).toBeNull();
    expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
  });

  it('uses normal links below the popup breakpoint', () => {
    renderCard(variant, { popup: true, width: 1024 });
    expect(screen.getByText('Example card').closest('a')).toHaveAttribute(
      'href',
      '/example/details',
    );
    expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
  });
});
