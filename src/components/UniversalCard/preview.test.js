import {
  getContentTypePreviewUrl,
  getIndicatorPreviewUrl,
  getIndicatorPreviewUrls,
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

  it('uses the preview image of the charts when chosen', () => {
    const chart = {
      '@id': '/chart',
      '@type': 'visualization',
      image_field: 'preview_image',
    };
    // list items show the preview image of the chart by default
    expect(getContentTypePreviewUrl(chart, { '@type': 'item' })).toBe(
      undefined,
    );
    expect(
      getContentTypePreviewUrl(chart, {
        '@type': 'card',
        chartPreview: 'image',
      }),
    ).toBe(undefined);
    // cards show the miniature by default
    expect(getContentTypePreviewUrl(chart, { '@type': 'card' })).toBe(
      '/chart/@@plotly_preview.svg/soer_miniature',
    );
    expect(
      getContentTypePreviewUrl(chart, {
        '@type': 'item',
        chartPreview: 'miniature',
      }),
    ).toBe('/chart/@@plotly_preview.svg/soer_miniature');
  });

  it('uses the miniature for charts without preview image', () => {
    expect(
      getContentTypePreviewUrl(
        { '@id': '/chart', '@type': 'visualization' },
        { '@type': 'item' },
      ),
    ).toBe('/chart/@@plotly_preview.svg/soer_miniature');
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
const INDICATOR = '/en/analysis/indicators/emissions-of-the-main-air';

// as returned by @search?path.query=...&path.depth=1&metadata_fields=image_scales
const child = (id, { review_state = 'published', preview = true } = {}) => ({
  '@id': `${INDICATOR}/${id}`,
  '@type': 'visualization',
  review_state,
  image_field: '',
  image_scales: preview
    ? {
        preview_image: [
          {
            'content-type': 'image/svg+xml',
            download: `@@images/preview_image-1200-${id}.svg`,
            scales: {
              preview: { download: `@@images/preview_image-400-${id}.svg` },
            },
          },
        ],
      }
    : null,
});

const previewOf = (id) =>
  `${INDICATOR}/${id}/@@images/preview_image-400-${id}.svg`;

describe('getIndicatorPreviewUrl', () => {
  const indicator = { '@id': INDICATOR, '@type': 'ims_indicator' };

  it('uses the preview image of the first child', () => {
    expect(
      getIndicatorPreviewUrls(indicator, [child('first'), child('second')]),
    ).toEqual([previewOf('first'), previewOf('second')]);
  });

  it('prefers an indicator lead image over its children', () => {
    expect(
      getIndicatorPreviewUrl(
        {
          ...indicator,
          image_field: 'image',
          image_scales: {
            image: [
              {
                download: '@@images/image-800-lead.png',
                scales: {
                  preview: { download: '@@images/image-400-lead.png' },
                },
              },
            ],
          },
        },
        [child('first')],
      ),
    ).toBe(`${INDICATOR}/@@images/image-400-lead.png`);
  });

  it('skips the children without preview image', () => {
    expect(
      getIndicatorPreviewUrl(indicator, [
        { '@id': `${INDICATOR}/photo`, '@type': 'Image', review_state: null },
        child('no-preview', { preview: false }),
        child('chart'),
      ]),
    ).toBe(previewOf('chart'));
  });

  it('prefers the published children', () => {
    expect(
      getIndicatorPreviewUrls(indicator, [
        child('draft', { review_state: 'private' }),
        child('published'),
      ]),
    ).toEqual([previewOf('published'), previewOf('draft')]);
  });

  it('only uses the children of the indicator', () => {
    expect(
      getIndicatorPreviewUrl(indicator, [
        {
          ...child('other'),
          '@id': '/en/analysis/indicators/other/chart',
        },
        {
          ...child('nested'),
          '@id': `${INDICATOR}/folder/chart`,
        },
        child('own'),
      ]),
    ).toBe(previewOf('own'));
  });

  it('uses app paths for the absolute urls of another host', () => {
    const host = 'https://staging.eea.europa.eu';
    expect(
      getIndicatorPreviewUrl({ ...indicator, '@id': `${host}${INDICATOR}` }, [
        { ...child('chart'), '@id': `${host}${INDICATOR}/chart` },
      ]),
    ).toBe(previewOf('chart'));
  });

  it('ignores a trailing slash of the indicator url', () => {
    expect(
      getIndicatorPreviewUrl({ ...indicator, '@id': `${INDICATOR}/` }, [
        child('chart'),
      ]),
    ).toBe(previewOf('chart'));
  });

  it('has no preview without lead image and children', () => {
    expect(getIndicatorPreviewUrl(indicator, [])).toBeUndefined();
    expect(getIndicatorPreviewUrl(indicator)).toBeUndefined();
    expect(getIndicatorPreviewUrl({}, [child('chart')])).toBeUndefined();
  });
});
