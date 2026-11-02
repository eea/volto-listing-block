import config from '@plone/volto/registry';
import { applySchemaDefaults } from '@plone/volto/helpers/Blocks/Blocks';
import installListing from '@eeacms/volto-listing-block/blocks/Listing';
import { getLayoutItemModel } from '@eeacms/volto-listing-block/components/UniversalCard/migrate';
import { getBorder } from '@eeacms/volto-listing-block/components/UniversalCard/border';
import {
  hideHiddenVariations,
  keepLegacyCardsOnGrid,
  keepSearchLayoutOnDefault,
  keepUnknownVariationOnDefault,
  migrateListingData,
  migrateSearchData,
  withSearchLayoutFallback,
  withUnknownVariationFallback,
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
  it('switches list/grid templates while preserving shared settings', () => {
    const data = {
      variation: 'summary',
      itemModel: {
        '@type': 'card',
        imagePosition: 'top',
        hasDate: true,
        styles: { 'border:noprefix': 'no-border' },
      },
    };
    const list = migrateListingData(data);
    expect(list.itemModel).toEqual({
      ...data.itemModel,
      '@type': 'item',
      imagePosition: 'left',
    });
    const grid = migrateListingData({ ...list, variation: 'cardsGallery' });
    expect(grid.itemModel).toEqual(data.itemModel);
    expect(migrateListingData(grid)).toBe(grid);
    expect(
      migrateSearchData({
        listingBodyTemplate: 'summary',
        itemModel: data.itemModel,
      }).itemModel['@type'],
    ).toBe('item');
  });
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
        styles: {
          'theme:noprefix': 'primary',
          'topAccent:bool': true,
          'dropShadow:bool': true,
        },
      }),
    });
  });

  it('keeps a drop shadow turned off on Visualization Cards', () => {
    expect(
      migrateListingData({
        variation: 'cardsVisualization',
        itemModel: { '@type': 'card', styles: { 'dropShadow:bool': false } },
      }).itemModel.styles,
    ).toEqual({ 'topAccent:bool': true, 'dropShadow:bool': false });
  });

  it('renders Visualization Cards as the Grid in view mode', () => {
    const View = () => null;
    const { data } = withUnknownVariationFallback(View)({
      data: { variation: 'cardsVisualization', itemModel: { '@type': 'card' } },
    }).props;
    expect(data).toEqual({
      variation: 'cardsGallery',
      gridSize: 'five',
      itemModel: {
        '@type': 'card',
        styles: { 'topAccent:bool': true, 'dropShadow:bool': true },
      },
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

describe('keepLegacyCardsOnGrid', () => {
  const legacyCardList = {
    variation: 'summary',
    gridSize: 'six',
    itemModel: { '@type': 'card', hasLabel: true, maxTitle: 5 },
  };

  it('turns a List of legacy cards into the Grid it rendered', () => {
    expect(keepLegacyCardsOnGrid(legacyCardList)).toEqual({
      ...legacyCardList,
      variation: 'cardsGallery',
      gridSize: 'three',
    });
    expect(
      keepLegacyCardsOnGrid({
        ...legacyCardList,
        itemModel: { '@type': 'imageCard' },
      }).variation,
    ).toBe('cardsGallery');
  });

  it('keeps the cards of the migrated data, with their label', () => {
    expect(migrateListingData(legacyCardList)).toEqual({
      variation: 'cardsGallery',
      gridSize: 'three',
      itemModel: expect.objectContaining({
        '@type': 'card',
        imagePosition: 'top',
        hasLabel: true,
        maxTitle: 5,
      }),
    });
  });

  it.each(['imageOnLeft', 'imageOnRight', 'imageOnBottom', 'item'])(
    'leaves the List of legacy %s alone',
    (type) => {
      const data = { variation: 'summary', itemModel: { '@type': type } };
      expect(keepLegacyCardsOnGrid(data)).toBe(data);
    },
  );

  it('leaves current cards and other layouts alone', () => {
    const current = {
      variation: 'summary',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    };
    expect(keepLegacyCardsOnGrid(current)).toBe(current);
    const carousel = { ...legacyCardList, variation: 'cardsCarousel' };
    expect(keepLegacyCardsOnGrid(carousel)).toBe(carousel);
    expect(keepLegacyCardsOnGrid(undefined)).toBeUndefined();
  });

  it('renders the Grid in view mode, before the block is edited', () => {
    const View = () => null;
    const element = withUnknownVariationFallback(View)({
      data: legacyCardList,
    });
    expect(element.props.data.variation).toBe('cardsGallery');
  });

  it('applies to the results layout of the search block', () => {
    const data = {
      listingBodyTemplate: 'summary',
      itemModel: { '@type': 'card' },
    };
    expect(migrateSearchData(data)).toEqual(
      expect.objectContaining({
        listingBodyTemplate: 'cardsGallery',
        gridSize: 'three',
        itemModel: expect.objectContaining({
          '@type': 'card',
          imagePosition: 'top',
        }),
      }),
    );
    const View = () => null;
    expect(
      withSearchLayoutFallback(View)({ data }).props.data.listingBodyTemplate,
    ).toBe('cardsGallery');
  });
});

// What the view renders: Volto applies the block defaults of the variation
// schema to the stored data, in any container, before the block view
describe('legacy layouts with the block defaults applied', () => {
  const intl = { formatMessage: ({ defaultMessage }) => defaultMessage };
  const View = () => null;
  const render = (stored) => {
    const variation = config.blocks.blocksConfig.listing.variations.find(
      ({ id }) => id === stored.variation,
    );
    const schema = variation.schemaEnhancer({
      schema: { fieldsets: [{ id: 'default', fields: [] }], properties: {} },
      formData: stored,
      intl,
    });
    const data = applySchemaDefaults({ data: stored, schema, intl });
    const viewData = withUnknownVariationFallback(View)({ data }).props.data;
    return {
      ...viewData,
      itemModel: getLayoutItemModel(viewData.itemModel, viewData.variation),
    };
  };

  it('renders a List of legacy cards as the Grid', () => {
    const data = render({
      '@type': 'listing',
      variation: 'summary',
      gridSize: 'six',
      itemModel: { '@type': 'card', hasLabel: true, maxTitle: 5 },
    });
    expect(data.variation).toBe('cardsGallery');
    expect(data.gridSize).toBe('three');
    expect(data.itemModel).toEqual(
      expect.objectContaining({
        '@type': 'card',
        imagePosition: 'top',
        hasLabel: true,
        maxTitle: 5,
      }),
    );
  });

  it('keeps the List of legacy side image cards and current items', () => {
    expect(
      render({
        '@type': 'listing',
        variation: 'summary',
        itemModel: { '@type': 'imageOnLeft' },
      }),
    ).toEqual(
      expect.objectContaining({
        variation: 'summary',
        itemModel: expect.objectContaining({
          '@type': 'item',
          imagePosition: 'left',
          size: 'small',
        }),
      }),
    );
    expect(
      render({
        '@type': 'listing',
        variation: 'summary',
        itemModel: { '@type': 'item', imagePosition: 'right' },
      }),
    ).toEqual(
      expect.objectContaining({
        variation: 'summary',
        itemModel: expect.objectContaining({ imagePosition: 'right' }),
      }),
    );
  });

  it('keeps off the controls the legacy list item did not render', () => {
    const data = render({
      '@type': 'listing',
      variation: 'summary',
      itemModel: {
        '@type': 'item',
        hasImage: true,
        imageOnRightSide: true,
        hasMetaType: true,
        hasTags: true,
        hasLabel: true,
        callToAction: { enable: true, label: 'Read more' },
      },
    });
    expect(data.itemModel).toEqual(
      expect.objectContaining({
        '@type': 'item',
        imagePosition: 'right',
        hasMetaType: false,
        hasTags: false,
        hasLabel: false,
        callToAction: expect.objectContaining({ enable: false }),
      }),
    );
  });

  it('renders Visualization Cards with top accent and drop shadow', () => {
    const data = render({
      '@type': 'listing',
      variation: 'cardsVisualization',
      itemModel: { '@type': 'card' },
    });
    expect(data.variation).toBe('cardsGallery');
    expect(data.gridSize).toBe('five');
    expect(getBorder(data.itemModel.styles)).toBe('top-accent');
    expect(data.itemModel.styles['dropShadow:bool']).toBe(true);
  });

  it('keeps a drop shadow turned off and the stored grid size', () => {
    const data = render({
      '@type': 'listing',
      variation: 'cardsVisualization',
      gridSize: 'four',
      itemModel: { '@type': 'card', styles: { 'dropShadow:bool': false } },
    });
    expect(data.gridSize).toBe('four');
    expect(data.itemModel.styles['dropShadow:bool']).toBe(false);
  });

  it('leaves the current Grid and Carousel cards without shadow', () => {
    ['cardsGallery', 'cardsCarousel'].forEach((variation) => {
      const data = render({
        '@type': 'listing',
        variation,
        itemModel: { '@type': 'card', imagePosition: 'top' },
      });
      expect(data.variation).toBe(variation);
      expect(data.itemModel.styles['dropShadow:bool']).toBe(false);
      expect(getBorder(data.itemModel.styles)).toBe('no-border');
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
          styles: { 'topAccent:bool': true, 'dropShadow:bool': true },
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
