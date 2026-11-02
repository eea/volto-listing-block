import {
  getContentTypePreviewUrl,
  getEmbedContentReferences,
  getIndicatorPreviewUrl,
} from './preview';

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

describe('getContentTypePreviewUrl', () => {
  it('uses the Plotly preview for interactive charts', () => {
    expect(
      getContentTypePreviewUrl({
        '@id': '/en/analysis/maps-and-charts/chart',
        '@type': 'visualization',
      }),
    ).toBe(
      '/en/analysis/maps-and-charts/chart/@@plotly_preview.svg/soer_miniature',
    );
  });

  it('has no content type preview for other types', () => {
    ['Document', 'chart_static', 'ims_indicator'].forEach((type) => {
      expect(
        getContentTypePreviewUrl({ '@id': '/x', '@type': type }),
      ).toBeUndefined();
    });
    expect(getContentTypePreviewUrl(undefined)).toBeUndefined();
  });
});

// Ported from the IMS visualization cards work (ims-vizualization-cards)
describe('getIndicatorPreviewUrl', () => {
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

  it('uses preview scales included directly in an embed content block', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
    };
    const previewDownload = '@@images/preview_image-400.svg';

    expect(
      getIndicatorPreviewUrl(indicator, [
        {
          ...indicator,
          blocks: {
            chart: {
              '@type': 'embed_content',
              url: '/en/analysis/maps-and-charts/chart',
              image_scales: {
                preview_image: [
                  {
                    scales: {
                      preview: { download: previewDownload },
                    },
                  },
                ],
              },
            },
          },
          blocks_layout: { items: ['chart'] },
        },
      ]),
    ).toBe(`/en/analysis/maps-and-charts/chart/${previewDownload}`);
  });

  it('uses an external image referenced directly by embed content', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
    };
    const previewUrl =
      'https://www.eea.europa.eu/data-and-maps/figures/chart/chart.png';

    expect(
      getIndicatorPreviewUrl(indicator, [
        {
          ...indicator,
          blocks: {
            chart: {
              '@type': 'embed_content',
              url: previewUrl,
            },
          },
          blocks_layout: { items: ['chart'] },
        },
      ]),
    ).toBe(previewUrl);
  });

  it('uses the preview of a Plotly embed referenced by path', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/test-indicator',
      '@type': 'ims_indicator',
    };
    const chartPath = '/en/analysis/maps-and-charts/chart';

    expect(
      getIndicatorPreviewUrl(indicator, [
        {
          ...indicator,
          blocks: {
            chart: {
              '@type': 'embed_visualization',
              vis_url: chartPath,
            },
          },
          blocks_layout: { items: ['chart'] },
        },
      ]),
    ).toBe(`${chartPath}/@@plotly_preview.svg/soer_miniature`);
  });

  it('uses the first Plotly preview when its internal URL is absolute', () => {
    const indicator = {
      '@id': '/en/analysis/indicators/status-of-marine-fish-and.1',
      '@type': 'ims_indicator',
    };
    const firstChartPath =
      '/en/analysis/indicators/status-of-marine-fish-and.1/state-of-assessed-commercially-exploited';
    const firstChartUrl = `https://demo-www.eea.europa.eu${firstChartPath}`;

    expect(
      getIndicatorPreviewUrl(indicator, [
        {
          ...indicator,
          blocks: {
            first: {
              '@type': 'embed_visualization',
              vis_url: firstChartUrl,
            },
            second: {
              '@type': 'embed_content',
              url: '/visualizations/second-chart.png',
            },
          },
          blocks_layout: { items: ['first', 'second'] },
        },
      ]),
    ).toBe(`${firstChartPath}/@@plotly_preview.svg/soer_miniature`);
  });

  it('recognizes Plotly, legacy Plotly, and data figure references', () => {
    expect(
      getEmbedContentReferences({
        blocks_layout: { items: ['plotly', 'legacy', 'figure'] },
        blocks: {
          plotly: {
            '@type': 'embed_visualization',
            vis_url: '/visualizations/plotly',
          },
          legacy: {
            '@type': 'embed_chart',
            vis_url: '/visualizations/legacy',
          },
          figure: {
            '@type': 'dataFigure',
            figureUrl: '/visualizations/data-figure',
            url: '/visualizations/data-figure/preview.svg',
          },
        },
      }),
    ).toEqual([
      {
        path: '/visualizations/plotly',
        url: '/visualizations/plotly',
        previewUrl:
          '/visualizations/plotly/@@plotly_preview.svg/soer_miniature',
      },
      {
        path: '/visualizations/legacy',
        url: '/visualizations/legacy',
        previewUrl:
          '/visualizations/legacy/@@plotly_preview.svg/soer_miniature',
      },
      {
        path: '/visualizations/data-figure',
        url: '/visualizations/data-figure',
        previewUrl: '/visualizations/data-figure/preview.svg',
      },
    ]);
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
});
