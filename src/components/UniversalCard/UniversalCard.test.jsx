import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import UniversalCard from './UniversalCard';

jest.mock('uuid', () => ({ v4: () => 'uuid' }), { virtual: true });
jest.mock('./fragments/RenderBlocksWrapper', () => () => null);

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: { publicURL: '', styleClassNameConverters: {} },
    blocks: {
      blocksConfig: {
        listing: {
          extensions: {
            cardTemplates: [
              {
                id: 'card',
                isDefault: true,
                template: ({ preview_image_url, itemModel }) => (
                  <div data-testid="card" data-type={itemModel['@type']}>
                    {preview_image_url || 'no-preview'}
                  </div>
                ),
              },
            ],
          },
        },
      },
    },
  },
}));

jest.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  buildStyleClassNamesFromData: () => [],
}));

const mockStore = configureStore([]);

const renderCard = (props) =>
  render(
    <Provider store={mockStore({ screen: {} })}>
      <UniversalCard itemModel={{ '@type': 'card' }} {...props} />
    </Provider>,
  );

describe('UniversalCard preview image', () => {
  it('uses the Plotly preview for interactive charts', () => {
    renderCard({ item: { '@id': '/chart', '@type': 'visualization' } });
    expect(screen.getByTestId('card')).toHaveTextContent(
      '/chart/@@plotly_preview.svg/soer_miniature',
    );
  });

  it('uses the item image for other content types', () => {
    renderCard({ item: { '@id': '/page', '@type': 'Document' } });
    expect(screen.getByTestId('card')).toHaveTextContent('no-preview');
  });

  it('prefers an explicit preview url', () => {
    renderCard({
      item: { '@id': '/chart', '@type': 'visualization' },
      preview_image_url: '/resolved.png',
    });
    expect(screen.getByTestId('card')).toHaveTextContent('/resolved.png');
  });

  it('prefers a chosen preview image (teaser)', () => {
    renderCard({
      item: { '@id': '/chart', '@type': 'visualization' },
      preview_image: [{ '@id': '/custom-image' }],
    });
    expect(screen.getByTestId('card')).toHaveTextContent('no-preview');
  });

  it('migrates legacy card types', () => {
    renderCard({
      item: { '@id': '/page' },
      itemModel: { '@type': 'visualizationCard' },
    });
    expect(screen.getByTestId('card')).toHaveAttribute('data-type', 'card');
  });
});
