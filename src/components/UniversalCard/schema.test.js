import config from '@plone/volto/registry';
import installListing from '@eeacms/volto-listing-block/blocks/Listing';
import schemaEnhancer from './schema';

jest.mock('uuid', () => ({ v4: () => 'uuid' }), { virtual: true });

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/fragments/RenderBlocksWrapper',
  () => () => null,
);

const intl = {
  formatMessage: ({ defaultMessage }) => defaultMessage,
};

const baseSchema = () => ({
  fieldsets: [{ id: 'default', title: 'Default', fields: [] }],
  properties: {},
  required: [],
});

const getItemModelSchema = (formData) =>
  schemaEnhancer({ schema: baseSchema(), formData, intl }).properties.itemModel
    .schema;

const fields = (schema) => schema.fieldsets[0].fields;

describe('UniversalCard schemaEnhancer', () => {
  beforeAll(() => {
    config.settings = { ...(config.settings || {}) };
    config.blocks = {
      blocksConfig: {
        listing: { variations: [], extensions: {}, edit: () => null },
      },
    };
    installListing(config);
  });

  it('offers only the two base templates', () => {
    const schema = getItemModelSchema({ variation: 'summary', itemModel: {} });
    expect(schema.properties['@type'].choices).toEqual([
      ['card', 'Card'],
      ['item', 'List item'],
    ]);
    expect(schema.properties['@type'].default).toBe('card');
  });

  it('has no link toggle nor image source control', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    expect(fields(schema)).not.toContain('hasLink');
    expect(fields(schema)).not.toContain('imageSource');
  });

  it('builds the card controls', () => {
    const schema = getItemModelSchema({
      variation: 'summary',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    expect(fields(schema)).toEqual(
      expect.arrayContaining([
        'contentMode',
        'imagePosition',
        'titleOnImage',
        'hasBenchmarkLevel',
        'hasIcon',
        'callToAction',
      ]),
    );
    expect(
      schema.properties.imagePosition.choices.map(([value]) => value),
    ).toEqual(['top', 'bottom', 'left', 'right', 'none']);
  });

  it('hides horizontal image positions in carousel and gallery', () => {
    ['cardsCarousel', 'cardsGallery'].forEach((variation) => {
      const schema = getItemModelSchema({
        variation,
        itemModel: { '@type': 'card' },
      });
      expect(
        schema.properties.imagePosition.choices.map(([value]) => value),
      ).toEqual(['top', 'bottom', 'none']);
    });
  });

  it('reduces the card controls in overlay mode', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', contentMode: 'overlay' },
    });
    expect(fields(schema)).toEqual([
      '@type',
      'contentMode',
      'titleOnImage',
      'hasLabel',
    ]);
  });

  it('builds the list item controls', () => {
    const schema = getItemModelSchema({
      itemModel: {
        '@type': 'item',
        imagePosition: 'none',
        hasIcon: true,
        callToAction: { enable: true },
      },
    });
    expect(fields(schema)).toEqual(
      expect.arrayContaining([
        'imagePosition',
        'size',
        'icon',
        'callToAction',
        'enableCTAPopup',
      ]),
    );
    expect(fields(schema)).not.toContain('hasLabel');
    expect(
      schema.properties.imagePosition.choices.map(([value]) => value),
    ).toEqual(['left', 'right', 'none']);
  });

  it('uses the migrated values as defaults for legacy data', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'imageOnRight' },
    });
    expect(schema.properties.imagePosition.default).toBe('right');
    expect(schema.properties.hasDate.default).toBe(true);

    const itemSchema = getItemModelSchema({
      itemModel: { '@type': 'simpleItem' },
    });
    expect(fields(itemSchema)).toContain('size');
    expect(itemSchema.properties.size.default).toBe('compact');
    expect(itemSchema.properties.imagePosition.default).toBe('none');
  });

  it('offers the top accent style only on cards', () => {
    const styles = (itemModel) =>
      fields(getItemModelSchema({ itemModel }).properties.styles.schema);
    expect(styles({ '@type': 'card', imagePosition: 'top' })).toContain(
      'topAccent:bool',
    );
    expect(styles({ '@type': 'item', imagePosition: 'none' })).not.toContain(
      'topAccent:bool',
    );
  });

  it('shows image styling only when there is an image', () => {
    const styles = (itemModel) =>
      fields(getItemModelSchema({ itemModel }).properties.styles.schema);
    expect(styles({ '@type': 'card', imagePosition: 'top' })).toContain(
      'objectFit',
    );
    expect(styles({ '@type': 'item', imagePosition: 'none' })).not.toContain(
      'objectFit',
    );
    expect(styles({ '@type': 'item', imagePosition: 'none' })).toContain(
      'bordered:bool',
    );
  });
});
