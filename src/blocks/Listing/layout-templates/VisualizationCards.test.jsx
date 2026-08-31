import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import VisualizationCards, {
  getEmbedContentReferences,
  getEmbeddedContentSubrequestId,
  getIndicatorContentSubrequestId,
  getIndicatorPreviewUrl,
} from './VisualizationCards';

const mockSearchContent = jest.fn();

// Mock the dependencies
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      dateLocale: 'en',
    },
  },
}));

jest.mock('@plone/volto/actions/search/search', () => ({
  searchContent: (...args) => {
    mockSearchContent(...args);
    return { type: 'SEARCH_CONTENT' };
  },
}));

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard',
  () => {
    return jest.fn(({ item }) => (
      <div data-testid="universal-card">
        <div data-testid="card-title">{item.title}</div>
        <div data-testid="card-id">{item['@id']}</div>
      </div>
    ));
  },
);

// Mock moment
jest.mock('moment', () => {
  const mockMoment = () => ({
    locale: jest.fn(),
    format: jest.fn(() => 'formatted-date'),
  });
  mockMoment.locale = jest.fn();
  return mockMoment;
});

// Mock the getVocabulary action
const mockGetVocabulary = jest.fn();
jest.mock('@plone/volto/actions/vocabularies/vocabularies', () => ({
  getVocabulary: (...args) => {
    mockGetVocabulary(...args);
    return { type: 'GET_VOCABULARY' };
  },
}));

const mockStore = configureStore([]);

describe('VisualizationCards', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      search: {
        subrequests: {},
      },
      vocabularies: {
        'collective.taxonomy.benchmark_level': {
          items: [
            { value: 'level1', label: 'Level 1' },
            { value: 'level2', label: 'Level 2' },
          ],
        },
      },
    });
    mockGetVocabulary.mockClear();
    mockSearchContent.mockClear();
  });

  const items = [
    {
      '@id': '/visualization/item1',
      title: 'Visualization Item 1',
      description: 'Description of Visualization Item 1',
    },
    {
      '@id': '/visualization/item2',
      title: 'Visualization Item 2',
      description: 'Description of Visualization Item 2',
    },
  ];

  it('renders visualization items correctly', () => {
    render(
      <Provider store={store}>
        <VisualizationCards items={items} />
      </Provider>,
    );

    // Check if UniversalCard components are rendered for each item
    const cards = screen.getAllByTestId('universal-card');
    expect(cards).toHaveLength(2);

    // Check if titles are rendered
    expect(screen.getByText('Visualization Item 1')).toBeInTheDocument();
    expect(screen.getByText('Visualization Item 2')).toBeInTheDocument();
  });

  it('applies the correct grid size class', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCards items={items} gridSize="five" />
      </Provider>,
    );

    // Check if the grid size class is applied
    expect(container.querySelector('.ui.fluid.five.cards')).toBeInTheDocument();
  });

  it('applies a different grid size class when specified', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCards items={items} gridSize="six" />
      </Provider>,
    );

    // Check if the grid size class is applied
    expect(container.querySelector('.ui.fluid.six.cards')).toBeInTheDocument();
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCards items={[]} />
      </Provider>,
    );

    // Check if no cards are rendered
    expect(container.querySelector('.ui.fluid.cards')).not.toBeInTheDocument();
  });

  it('passes props to UniversalCard component', () => {
    // Clear previous calls
    const UniversalCardMock = require('@eeacms/volto-listing-block/components/UniversalCard/UniversalCard');
    UniversalCardMock.mockClear();

    render(
      <Provider store={store}>
        <VisualizationCards
          items={[items[0]]} // Use only one item to simplify testing
          block="test-block"
          isEditMode={true}
          hasDate={true}
          hasDescription={true}
        />
      </Provider>,
    );

    // Check that the props are passed correctly
    expect(UniversalCardMock).toHaveBeenCalled();
    const callProps = UniversalCardMock.mock.calls[0][0];

    // Only check the props that we know are passed
    expect(callProps.item).toEqual(items[0]);
    expect(callProps.block).toBe('test-block');
  });

  it('fetches the benchmark_level vocabulary on mount', () => {
    render(
      <Provider store={store}>
        <VisualizationCards items={items} />
      </Provider>,
    );

    // Check if getVocabulary action is dispatched with the correct parameters
    expect(mockGetVocabulary).toHaveBeenCalledWith({
      vocabNameOrURL: 'collective.taxonomy.benchmark_level',
    });
  });

  it('fetches full indicator objects for lead images and embed blocks', () => {
    const indicatorItems = [
      {
        '@id': '/en/analysis/indicators/test-indicator',
        '@type': 'ims_indicator',
        title: 'Test indicator',
      },
    ];
    const subrequestId = getIndicatorContentSubrequestId(
      'test-block',
      indicatorItems.map((item) => item['@id']),
    );

    render(
      <Provider store={store}>
        <VisualizationCards items={indicatorItems} block="test-block" />
      </Provider>,
    );

    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      expect.objectContaining({
        portal_type: 'ims_indicator',
        path: ['/en/analysis/indicators/test-indicator'],
        'path.depth': 0,
        fullobjects: 1,
      }),
      subrequestId,
    );
  });

  it('fetches preview metadata for the contents referenced by embed blocks', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
      title: 'Test indicator',
    };
    const embeddedUIDs = ['first-uid', 'second-uid'];
    const contentSubrequestId = getIndicatorContentSubrequestId('test-block', [
      indicator['@id'],
    ]);
    const embeddedContentSubrequestId = getEmbeddedContentSubrequestId(
      'test-block',
      embeddedUIDs,
    );

    store = mockStore({
      search: {
        subrequests: {
          [contentSubrequestId]: {
            loaded: true,
            loading: false,
            items: [
              {
                ...indicator,
                blocks: {
                  first: {
                    '@type': 'embed_content',
                    url: '../../../../resolveuid/first-uid',
                  },
                  second: {
                    '@type': 'embed_content',
                    url: '../../../../resolveuid/second-uid',
                  },
                },
                blocks_layout: { items: ['first', 'second'] },
              },
            ],
          },
        },
      },
      vocabularies: {},
    });

    render(
      <Provider store={store}>
        <VisualizationCards items={[indicator]} block="test-block" />
      </Provider>,
    );

    expect(mockSearchContent).toHaveBeenCalledWith(
      '',
      {
        UID: embeddedUIDs,
        b_size: 25,
        metadata_fields: ['UID', 'image_field', 'image_scales'],
      },
      embeddedContentSubrequestId,
    );
    expect(mockSearchContent).not.toHaveBeenCalledWith(
      '',
      expect.objectContaining({ portal_type: 'visualization' }),
      expect.anything(),
    );
  });

  it('passes an embedded content preview to the indicator card', () => {
    const UniversalCardMock = require('@eeacms/volto-listing-block/components/UniversalCard/UniversalCard');
    UniversalCardMock.mockClear();
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
      title: 'Test indicator',
    };
    const embeddedUIDs = ['embedded-uid'];
    const previewDownload = '@@images/preview_image-400.svg';
    const contentSubrequestId = getIndicatorContentSubrequestId('test-block', [
      indicator['@id'],
    ]);
    const embeddedContentSubrequestId = getEmbeddedContentSubrequestId(
      'test-block',
      embeddedUIDs,
    );

    store = mockStore({
      search: {
        subrequests: {
          [contentSubrequestId]: {
            loaded: true,
            loading: false,
            items: [
              {
                ...indicator,
                blocks: {
                  figure: {
                    '@type': 'embed_content',
                    url: '../../../../resolveuid/embedded-uid',
                  },
                },
                blocks_layout: { items: ['figure'] },
              },
            ],
          },
          [embeddedContentSubrequestId]: {
            loaded: true,
            loading: false,
            items: [
              {
                UID: 'embedded-uid',
                '@id': '/visualizations/embedded',
                image_field: 'preview_image',
                image_scales: {
                  preview_image: [
                    {
                      base_path: '/visualizations/embedded',
                      scales: { preview: { download: previewDownload } },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      vocabularies: {},
    });

    render(
      <Provider store={store}>
        <VisualizationCards items={[indicator]} block="test-block" />
      </Provider>,
    );

    expect(UniversalCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        item: indicator,
        preview_image_url: `/visualizations/embedded/${previewDownload}`,
      }),
      expect.anything(),
    );
    expect(mockSearchContent).not.toHaveBeenCalled();
  });

  it('prefers an indicator lead image over embedded previews', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
      image_field: 'image',
      image_scales: {
        image: [
          {
            base_path: '/en/analysis/indicators/test-indicator/@@images/image',
            scales: {
              preview: {
                download: 'preview-image.png',
                width: 400,
                height: 300,
              },
            },
          },
        ],
      },
    };

    expect(
      getIndicatorPreviewUrl(indicator, [
        {
          '@id': indicator['@id'],
          blocks: {
            figure: {
              '@type': 'embed_content',
              url: '../../../../resolveuid/embedded-uid',
            },
          },
        },
      ]),
    ).toBe(
      '/en/analysis/indicators/test-indicator/@@images/image/preview-image.png',
    );
  });

  it('uses the first embed content that has a preview image', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
    };
    const indicatorContent = {
      ...indicator,
      blocks_layout: { items: ['group'] },
      blocks: {
        group: {
          '@type': 'group',
          data: {
            blocks_layout: { items: ['first', 'second'] },
            blocks: {
              first: {
                '@type': 'embed_content',
                url: '../../../../resolveuid/first-uid',
              },
              second: {
                '@type': 'embed_content',
                url: '../../../../resolveuid/second-uid',
              },
            },
          },
        },
      },
    };
    const previewDownload = '@@images/preview_image-400.svg';

    expect(
      getIndicatorPreviewUrl(
        indicator,
        [indicatorContent],
        [
          {
            UID: 'second-uid',
            '@id': '/visualizations/second',
            image_field: 'preview_image',
            image_scales: {
              preview_image: [
                {
                  base_path: '/visualizations/second',
                  scales: { preview: { download: previewDownload } },
                },
              ],
            },
          },
          {
            UID: 'first-uid',
            '@id': '/visualizations/first',
            image_field: 'preview_image',
            image_scales: {
              preview_image: [
                {
                  base_path: '/visualizations/first',
                  scales: { preview: { download: previewDownload } },
                },
              ],
            },
          },
        ],
      ),
    ).toBe(`/visualizations/first/${previewDownload}`);
  });

  it('uses the second embed when the first has no preview image', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
    };
    const previewDownload = '@@images/preview_image-400.svg';

    expect(
      getIndicatorPreviewUrl(
        indicator,
        [
          {
            ...indicator,
            blocks_layout: { items: ['first', 'second'] },
            blocks: {
              first: {
                '@type': 'embed_content',
                url: '../../../../resolveuid/first-uid',
              },
              second: {
                '@type': 'embed_content',
                url: '../../../../resolveuid/second-uid',
              },
            },
          },
        ],
        [
          { UID: 'first-uid', '@id': '/visualizations/first' },
          {
            UID: 'second-uid',
            '@id': '/visualizations/second',
            image_field: 'preview_image',
            image_scales: {
              preview_image: [
                {
                  base_path: '/visualizations/second',
                  scales: { preview: { download: previewDownload } },
                },
              ],
            },
          },
        ],
      ),
    ).toBe(`/visualizations/second/${previewDownload}`);
  });

  it('finds nested embed contents in block layout order', () => {
    expect(
      getEmbedContentReferences({
        blocks_layout: { items: ['group'] },
        blocks: {
          group: {
            '@type': 'group',
            data: {
              blocks_layout: { items: ['second', 'first'] },
              blocks: {
                first: {
                  '@type': 'embed_content',
                  url: '../../../../resolveuid/first-uid',
                },
                second: {
                  '@type': 'embed_content',
                  href: '../../../../resolveuid/second-uid',
                },
              },
            },
          },
        },
      }),
    ).toEqual([
      {
        uid: 'second-uid',
        url: '../../../../resolveuid/second-uid',
      },
      { uid: 'first-uid', url: '../../../../resolveuid/first-uid' },
    ]);
  });

  describe('schemaEnhancer', () => {
    it('enhances schema correctly', () => {
      const schema = {
        fieldsets: [{ id: 'default', fields: [] }],
        properties: {},
      };

      const enhancedSchema = VisualizationCards.schemaEnhancer({ schema });

      // Check if the new fieldset is added
      expect(enhancedSchema.fieldsets[1].id).toBe('cardsVisualization');
      expect(enhancedSchema.fieldsets[1].title).toBe('Visualization Cards');
      expect(enhancedSchema.fieldsets[1].fields).toContain('gridSize');

      // Check if the gridSize property is added
      expect(enhancedSchema.properties.gridSize).toBeDefined();
      expect(enhancedSchema.properties.gridSize.title).toBe('Grid Size');
      expect(enhancedSchema.properties.gridSize.choices).toEqual([
        ['four', 'Four'],
        ['five', 'Five'],
        ['six', 'Six'],
      ]);
      expect(enhancedSchema.properties.gridSize.default).toBe('five');
    });
  });
});
