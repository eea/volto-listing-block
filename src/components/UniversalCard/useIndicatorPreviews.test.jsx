import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import useIndicatorPreviews, { getSubrequestId } from './useIndicatorPreviews';

const mockSearchContent = jest.fn();
jest.mock('@plone/volto/actions/search/search', () => ({
  searchContent: (...args) => {
    mockSearchContent(...args);
    return { type: 'SEARCH_CONTENT' };
  },
}));

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      publicURL: '',
      apiPath: '',
      internalApiPath: '',
      externalRoutes: [],
    },
  },
}));

const mockStore = configureStore([]);

const indicator = {
  '@id': '/en/analysis/indicators/test',
  '@type': 'ims_indicator',
};
const page = { '@id': '/en/page', '@type': 'Document' };

const Previews = ({ items }) => {
  const getPreview = useIndicatorPreviews(items, 'b1');
  return items.map((item) => (
    <span key={item['@id']} data-testid={item['@id']}>
      {getPreview(item) || 'none'}
    </span>
  ));
};

const renderPreviews = (items, subrequests = {}) =>
  render(
    <Provider store={mockStore({ search: { subrequests } })}>
      <Previews items={items} />
    </Provider>,
  );

describe('useIndicatorPreviews', () => {
  beforeEach(() => mockSearchContent.mockClear());

  it('does not search when there are no indicators', () => {
    renderPreviews([page]);
    expect(mockSearchContent).not.toHaveBeenCalled();
  });

  it('searches the indicators in one batch', () => {
    renderPreviews([page, indicator]);
    expect(mockSearchContent).toHaveBeenCalledTimes(1);
    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      expect.objectContaining({
        portal_type: 'ims_indicator',
        path: ['/en/analysis/indicators/test'],
        'path.depth': 0,
        metadata_fields: expect.arrayContaining(['blocks', 'image_scales']),
      }),
      getSubrequestId('indicators', 'b1', ['/en/analysis/indicators/test']),
    );
  });

  it('returns the preview of the first embedded chart', () => {
    const id = getSubrequestId('indicators', 'b1', [
      '/en/analysis/indicators/test',
    ]);
    const { getByTestId } = renderPreviews([page, indicator], {
      [id]: {
        loaded: true,
        items: [
          {
            ...indicator,
            blocks_layout: { items: ['chart'] },
            blocks: {
              chart: {
                '@type': 'embed_visualization',
                vis_url: '/en/charts/chart',
              },
            },
          },
        ],
      },
    });
    expect(mockSearchContent).not.toHaveBeenCalled();
    expect(getByTestId('/en/analysis/indicators/test')).toHaveTextContent(
      '/en/charts/chart/@@plotly_preview.svg/soer_miniature',
    );
    expect(getByTestId('/en/page')).toHaveTextContent('none');
  });
});
