import config from '@plone/volto/registry';
import installListing from '@eeacms/volto-listing-block/blocks/Listing';
import {
  hideHiddenVariations,
  keepSearchLayoutOnDefault,
  keepUnknownVariationOnDefault,
  migrateListingData,
  migrateSearchData,
} from './variations';

jest.mock('uuid', () => ({ v4: () => 'uuid' }), { virtual: true });

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/fragments/RenderBlocksWrapper',
  () => () => null,
);

const variationSchema = () => ({
  fieldsets: [{ id: 'default', fields: ['variation'] }],
  properties: {
    variation: {
      choices: [
        ['default', 'Default'],
        ['imageGallery', 'Image gallery'],
        ['summary', 'List'],
        ['cardsGallery', 'Grid'],
        ['cardsCarousel', 'Carousel'],
        ['accordion', 'Accordion'],
        ['cardsVisualization', 'Visualization Cards'],
      ],
    },
  },
});

const choiceIds = (schema) =>
  schema.properties.variation.choices.map(([id]) => id);

describe('listing variations', () => {
  beforeAll(() => {
    config.settings = { ...(config.settings || {}) };
    config.blocks = {
      blocksConfig: {
        listing: {
          variations: [
            { id: 'default', isDefault: true, title: 'Default' },
            { id: 'imageGallery', title: 'Image gallery' },
            { id: 'summary', title: 'Summary' },
          ],
          extensions: {},
          edit: () => null,
        },
      },
    };
    installListing(config);
  });

  it('makes List the default layout', () => {
    const { variations } = config.blocks.blocksConfig.listing;
    expect(variations.filter(({ isDefault }) => isDefault)).toEqual([
      expect.objectContaining({ id: 'summary', title: 'List' }),
    ]);
  });

  it('offers only List, Grid, Carousel and Accordion', () => {
    const schema = hideHiddenVariations({
      schema: variationSchema(),
      formData: { variation: 'summary' },
    });
    expect(choiceIds(schema)).toEqual([
      'summary',
      'cardsGallery',
      'cardsCarousel',
      'accordion',
    ]);
  });

  it('keeps the hidden variation currently in use', () => {
    const schema = hideHiddenVariations({
      schema: variationSchema(),
      formData: { variation: 'default' },
    });
    expect(choiceIds(schema)).toContain('default');
    expect(choiceIds(schema)).not.toContain('cardsVisualization');
  });

  it('applies the filter in every variation schema', () => {
    config.blocks.blocksConfig.listing.variations.forEach((variation) => {
      const schema = variation.schemaEnhancer({
        schema: variationSchema(),
        formData: { variation: variation.id, itemModel: {} },
        intl: { formatMessage: ({ defaultMessage }) => defaultMessage },
      });
      const hidden = ['default', 'imageGallery', 'cardsVisualization'].filter(
        (id) => id !== variation.id,
      );
      hidden.forEach((id) => expect(choiceIds(schema)).not.toContain(id));
    });
  });
});

describe('keepUnknownVariationOnDefault', () => {
  it('keeps unregistered variations on the old default list', () => {
    expect(
      keepUnknownVariationOnDefault({ variation: 'customNewsListVariationId' }),
    ).toEqual({ variation: 'default' });
  });

  it('leaves registered and missing variations alone', () => {
    const grid = { variation: 'cardsGallery' };
    const empty = {};
    expect(keepUnknownVariationOnDefault(grid)).toBe(grid);
    expect(keepUnknownVariationOnDefault(empty)).toBe(empty);
  });

  it('is part of the edit migration', () => {
    expect(
      migrateListingData({ variation: 'customNewsListVariationId' }).variation,
    ).toBe('default');
  });
});

describe('migrateListingData', () => {
  it('returns current data unchanged', () => {
    const data = {
      variation: 'cardsGallery',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    };
    expect(migrateListingData(data)).toBe(data);
  });

  it('turns Visualization Cards into a Grid with top accent cards', () => {
    expect(
      migrateListingData({
        variation: 'cardsVisualization',
        gridSize: 'six',
        itemModel: {
          '@type': 'visualizationCard',
          styles: { 'theme:noprefix': 'primary' },
        },
      }),
    ).toEqual({
      variation: 'cardsGallery',
      gridSize: 'six',
      itemModel: expect.objectContaining({
        '@type': 'card',
        imagePosition: 'top',
        elementsOrder: [
          'contentType',
          'title',
          'date',
          'benchmark',
          'description',
          'image',
          'tags',
          'cta',
        ],
        styles: { 'theme:noprefix': 'primary', 'topAccent:bool': true },
      }),
    });
  });

  it('keeps the old default grid size of Visualization Cards', () => {
    expect(
      migrateListingData({ variation: 'cardsVisualization' }).gridSize,
    ).toBe('five');
  });

  it('migrates only the card model for other layouts', () => {
    expect(
      migrateListingData({
        variation: 'summary',
        itemModel: { '@type': 'simpleItem' },
      }),
    ).toEqual({
      variation: 'summary',
      itemModel: expect.objectContaining({ '@type': 'item', size: 'compact' }),
    });
  });
});

describe('search block', () => {
  const searchSchema = () => ({
    fieldsets: [{ id: 'default', fields: ['listingBodyTemplate'] }],
    properties: {
      listingBodyTemplate: {
        choices: [
          ['default', 'Default'],
          ['summary', 'List'],
          ['cardsGallery', 'Grid'],
          ['cardsVisualization', 'Visualization Cards'],
        ],
      },
      availableViews: {
        choices: [
          ['default', 'Default'],
          ['summary', 'List'],
          ['cardsGallery', 'Grid'],
          ['cardsVisualization', 'Visualization Cards'],
        ],
      },
    },
  });
  const ids = (field) => field.choices.map(([id]) => id);

  it('hides Visualization Cards from the results layout', () => {
    const schema = hideHiddenVariations({
      schema: searchSchema(),
      data: { listingBodyTemplate: 'cardsGallery' },
    });
    expect(ids(schema.properties.listingBodyTemplate)).toEqual([
      'summary',
      'cardsGallery',
    ]);
    expect(ids(schema.properties.availableViews)).toEqual([
      'summary',
      'cardsGallery',
    ]);
  });

  it('keeps the layouts in use', () => {
    const schema = hideHiddenVariations({
      schema: searchSchema(),
      data: {
        listingBodyTemplate: 'cardsVisualization',
        availableViews: ['default'],
      },
    });
    expect(ids(schema.properties.listingBodyTemplate)).toContain(
      'cardsVisualization',
    );
    expect(ids(schema.properties.availableViews)).toContain('default');
  });

  it('keeps search blocks without layout on the former default list', () => {
    expect(keepSearchLayoutOnDefault({})).toEqual({
      listingBodyTemplate: 'default',
    });
    const grid = { listingBodyTemplate: 'cardsGallery' };
    expect(keepSearchLayoutOnDefault(grid)).toBe(grid);
  });

  it('turns Visualization Cards results into a Grid with top accent cards', () => {
    expect(
      migrateSearchData({
        listingBodyTemplate: 'cardsVisualization',
        itemModel: { '@type': 'visualizationCard' },
      }),
    ).toEqual(
      expect.objectContaining({
        listingBodyTemplate: 'cardsGallery',
        gridSize: 'five',
        itemModel: expect.objectContaining({
          '@type': 'card',
          styles: { 'topAccent:bool': true },
        }),
      }),
    );
  });

  it('returns current search data unchanged', () => {
    const data = {
      listingBodyTemplate: 'cardsGallery',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    };
    expect(migrateSearchData(data)).toBe(data);
  });
});
