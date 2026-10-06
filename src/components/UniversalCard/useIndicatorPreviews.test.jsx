import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import useIndicatorPreviews, {
  getSitePath,
  getSubrequestId,
} from './useIndicatorPreviews';

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
  UID: 'indicator-uid',
};
const page = { '@id': '/en/page', '@type': 'Document', UID: 'page-uid' };

const Previews = ({ items }) => {
  const getPreview = useIndicatorPreviews(items, 'b1');
  return items.map((item) => (
    <span key={item['@id']} data-testid={item['@id']}>
      {getPreview(item).preview_image_url || 'none'}
      {(getPreview(item).preview_image_fallbacks || []).map((url) => (
        <i key={url}>{url}</i>
      ))}
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

  it('searches the indicators by UID in one batch', () => {
    renderPreviews([page, indicator]);
    expect(mockSearchContent).toHaveBeenCalledTimes(1);
    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      expect.objectContaining({
        portal_type: 'ims_indicator',
        UID: ['indicator-uid'],
        metadata_fields: expect.arrayContaining([
          'blocks',
          'image_scales',
          'getPath',
        ]),
      }),
      getSubrequestId('indicators', 'b1', ['indicator-uid']),
    );
  });

  it('falls back to the path for items without UID', () => {
    const { UID, ...withoutUID } = indicator;
    renderPreviews([withoutUID]);
    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      expect.objectContaining({
        path: ['/en/analysis/indicators/test'],
        'path.depth': 0,
      }),
      getSubrequestId('indicator-paths', 'b1', [
        '/en/analysis/indicators/test',
      ]),
    );
  });

  it('returns the preview of the first embedded chart', () => {
    const id = getSubrequestId('indicators', 'b1', ['indicator-uid']);
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

  it('prefixes embedded content paths with the site path', () => {
    const id = getSubrequestId('indicators', 'b1', ['indicator-uid']);
    renderPreviews([indicator], {
      [id]: {
        loaded: true,
        items: [
          {
            ...indicator,
            getPath: '/www/en/analysis/indicators/test',
            blocks_layout: { items: ['figure'] },
            blocks: {
              figure: { '@type': 'embed_content', url: '/en/figures/map' },
            },
          },
        ],
      },
    });
    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      expect.objectContaining({ path: ['/www/en/figures/map'] }),
      expect.any(String),
    );
  });
});

describe('useIndicatorPreviews fallbacks', () => {
  it('returns the next embedded previews as fallbacks', () => {
    const id = getSubrequestId('indicators', 'b1', ['indicator-uid']);
    const { getByTestId } = renderPreviews([indicator], {
      [id]: {
        loaded: true,
        items: [
          {
            ...indicator,
            blocks_layout: { items: ['dead', 'chart'] },
            blocks: {
              dead: {
                '@type': 'embed_content',
                url: 'https://www.eea.europa.eu/data-and-maps/figures/old.png',
              },
              chart: {
                '@type': 'embed_visualization',
                vis_url: '/en/charts/chart',
              },
            },
          },
        ],
      },
    });
    const preview = getByTestId('/en/analysis/indicators/test');
    expect(preview).toHaveTextContent(
      'https://www.eea.europa.eu/data-and-maps/figures/old.png',
    );
    expect(preview.querySelector('i')).toHaveTextContent(
      '/en/charts/chart/@@plotly_preview.svg/soer_miniature',
    );
  });
});

describe('getSitePath', () => {
  it('derives the physical site prefix', () => {
    expect(getSitePath([{ '@id': '/en/x', getPath: '/www/en/x' }])).toBe(
      '/www',
    );
  });

  it('is empty for virtual hosted sites', () => {
    expect(getSitePath([{ '@id': '/en/x', getPath: '/en/x' }])).toBe('');
    expect(getSitePath([])).toBe('');
  });
});
