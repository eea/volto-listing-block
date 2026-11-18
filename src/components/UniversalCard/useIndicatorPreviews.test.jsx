import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import useIndicatorPreviews, {
  getChildrenQuery,
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

const indicatorPath = '/en/analysis/indicators/test';
const childrenId = getSubrequestId('indicator-children', 'b1', [indicatorPath]);

const chart = (id, review_state = 'published') => ({
  '@id': `${indicatorPath}/${id}`,
  '@type': 'visualization',
  review_state,
  image_scales: {
    preview_image: [
      {
        download: `@@images/preview_image-1200-${id}.svg`,
        scales: {
          preview: { download: `@@images/preview_image-400-${id}.svg` },
        },
      },
    ],
  },
});
const previewOf = (id) =>
  `${indicatorPath}/${id}/@@images/preview_image-400-${id}.svg`;

describe('useIndicatorPreviews', () => {
  beforeEach(() => mockSearchContent.mockClear());

  it('does not search when there are no indicators', () => {
    renderPreviews([page]);
    expect(mockSearchContent).not.toHaveBeenCalled();
  });

  it('searches the children of all the indicators in one batch', () => {
    const other = {
      ...indicator,
      '@id': '/en/analysis/indicators/other',
      UID: 'other-uid',
    };
    // the same indicator twice, once with a trailing slash
    renderPreviews([
      page,
      indicator,
      other,
      { ...indicator, '@id': `${indicatorPath}/` },
    ]);
    const paths = [indicatorPath, '/en/analysis/indicators/other'];
    expect(mockSearchContent).toHaveBeenCalledTimes(1);
    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      getChildrenQuery(paths),
      getSubrequestId('indicator-children', 'b1', paths),
    );
  });

  it('searches absolute urls of another host by their path', () => {
    // e.g. a proxied backend returns the urls of its own host
    renderPreviews([
      { ...indicator, '@id': `https://staging.eea.europa.eu${indicatorPath}` },
    ]);
    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      getChildrenQuery([indicatorPath]),
      childrenId,
    );
  });

  it('does not search again once loaded', () => {
    renderPreviews([indicator], { [childrenId]: { loaded: true, items: [] } });
    expect(mockSearchContent).not.toHaveBeenCalled();
  });

  it('returns the preview of the first published child', () => {
    const { getByTestId } = renderPreviews([page, indicator], {
      [childrenId]: {
        loaded: true,
        items: [chart('draft', 'private'), chart('first'), chart('second')],
      },
    });
    const preview = getByTestId(indicatorPath);
    expect(preview.childNodes[0].textContent).toBe(previewOf('first'));
    expect(
      [...preview.querySelectorAll('i')].map((node) => node.textContent),
    ).toEqual([previewOf('second'), previewOf('draft')]);
    expect(getByTestId('/en/page')).toHaveTextContent('none');
  });

  it('has no preview for indicators without charts', () => {
    const { getByTestId } = renderPreviews([indicator], {
      [childrenId]: { loaded: true, items: [] },
    });
    expect(getByTestId(indicatorPath)).toHaveTextContent('none');
  });
});

describe('getChildrenQuery', () => {
  it('only asks for catalog metadata', () => {
    const query = getChildrenQuery(['/en/a', '/en/b']);
    expect(query).toEqual({
      'path.query': ['/en/a', '/en/b'],
      'path.depth': 1,
      sort_on: 'getObjPositionInParent',
      b_size: 25,
      metadata_fields: ['image_field', 'image_scales'],
    });
    expect(query.metadata_fields).not.toContain('blocks');
    expect(query.metadata_fields).not.toContain('blocks_layout');
  });

  it('fits the children of all the indicators in one batch', () => {
    const paths = Array.from({ length: 30 }, (_, index) => `/en/${index}`);
    expect(getChildrenQuery(paths).b_size).toBe(300);
  });
});
