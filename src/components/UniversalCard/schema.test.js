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
  it('offers an opt-in drop shadow only on cards', () => {
    const card = getItemModelSchema({
      variation: 'cardsGallery',
      itemModel: {},
    }).properties.styles.schema;
    expect(fields(card)).toContain('dropShadow:bool');
    expect(card.properties['dropShadow:bool'].default).toBe(false);
    const list = getItemModelSchema({ variation: 'summary', itemModel: {} })
      .properties.styles.schema;
    expect(fields(list)).not.toContain('dropShadow:bool');
  });
  it.each([
    ['summary', 'item', 'card'],
    ['cardsGallery', 'card', 'item'],
  ])('locks %s to %s instead of the saved %s', (variation, type, saved) => {
    const schema = getItemModelSchema({
      variation,
      itemModel: { '@type': saved, imagePosition: 'none' },
    });
    expect(fields(schema)).not.toContain('@type');
    expect(schema.properties['@type'].default).toBe(type);
    expect(fields(schema)).toContain('elementsOrder');
  });
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
    const schema = getItemModelSchema({
      variation: 'cardsCarousel',
      itemModel: {},
    });
    expect(schema.properties['@type'].choices).toEqual([
      ['card', 'Card'],
      ['item', 'List item'],
    ]);
    expect(schema.properties['@type'].default).toBe('card');
  });

  it('offers the elements order with drag and drop', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top', hasMetaType: false },
    });
    expect(fields(schema)).toContain('elementsOrder');
    const property = schema.properties.elementsOrder;
    expect(property.widget).toBe('card_elements');
    expect(property.elements.map(([id]) => id)).toEqual([
      'image',
      'contentType',
      'date',
      'title',
      'benchmark',
      'description',
      'tags',
      'cta',
    ]);
    // each row: a visibility toggle and the settings shown when expanded
    expect(property.elementSettings.date).toEqual({
      toggle: { field: 'hasDate', on: true, off: false, defaultVisible: true },
      fields: ['hasEventDate'],
    });
    expect(property.elementSettings.title.toggle).toBeUndefined();
    expect(property.elementSettings.title.fields).toEqual([
      'maxTitle',
      'hasIcon',
    ]);
    expect(property.elementSettings.image.toggle).toEqual({
      field: 'imagePosition',
      on: 'top',
      off: 'none',
    });
    expect(property.fieldSchemas.maxTitle.type).toBe('number');
    expect(property.fieldSchemas.hasEventDate.type).toBe('boolean');
  });

  it('offers tags and the call to action as elements', () => {
    const schema = getItemModelSchema({
      '@type': 'listing',
      variation: 'cardsGallery',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    const { elementSettings, fieldSchemas } = schema.properties.elementsOrder;
    expect(elementSettings.tags.toggle.field).toBe('hasTags');
    expect(elementSettings.cta).toEqual({
      toggle: {
        field: 'callToAction',
        key: 'enable',
        on: true,
        off: false,
        defaultVisible: false,
      },
      fields: [
        { field: 'callToAction', key: 'label' },
        { field: 'callToAction', key: 'urlTemplate' },
        'enableCTAPopup',
      ],
    });
    expect(fieldSchemas['callToAction.label'].title).toBe('Action label');
    expect(fieldSchemas['callToAction.urlTemplate']).toBeDefined();
    expect(fieldSchemas.enableCTAPopup.type).toBe('boolean');
  });

  it('uses the link field for the call to action of teasers', () => {
    const schema = getItemModelSchema({
      '@type': 'teaser',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    expect(
      schema.properties.elementsOrder.elementSettings.cta.fields[1],
    ).toEqual({ field: 'callToAction', key: 'href' });
  });

  it('shows the icon setting once the icon is enabled', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top', hasIcon: true },
    });
    expect(
      schema.properties.elementsOrder.elementSettings.title.fields,
    ).toEqual(['maxTitle', 'hasIcon', 'icon']);
    expect(schema.properties.elementsOrder.fieldSchemas.icon).toBeDefined();
  });

  it('leaves the image out of the order for side images', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'left' },
    });
    expect(
      schema.properties.elementsOrder.elements.map(([id]) => id),
    ).not.toContain('image');
  });

  it('keeps the legacy bottom position available when stored', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'bottom' },
    });
    expect(
      schema.properties.imagePosition.choices.map(([value]) => value),
    ).toContain('bottom');
  });

  it('has no link toggle nor image source control', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    expect(fields(schema)).not.toContain('hasLink');
    expect(fields(schema)).not.toContain('imageSource');
  });

  it('builds the card controls for a grid', () => {
    const schema = getItemModelSchema({
      variation: 'cardsGallery',
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    // the element settings live in the elements widget
    expect(fields(schema)).toEqual([
      'contentMode',
      'imagePosition',
      'flip',
      'elementsOrder',
    ]);
    expect(
      schema.properties.imagePosition.choices.map(([value]) => value),
    ).toEqual(['top', 'none']);
  });

  it('keeps the side image label as field and the title on image in the title row', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'left' },
    });
    expect(fields(schema)).toContain('hasLabel');
    expect(fields(schema)).not.toContain('titleOnImage');
    expect(
      schema.properties.elementsOrder.elementSettings.title.fields,
    ).toContain('titleOnImage');
  });

  it('offers the title on image in the title row of list items', () => {
    const titleFields = (itemModel) =>
      getItemModelSchema({ itemModel }).properties.elementsOrder.elementSettings
        .title.fields;
    expect(titleFields({ '@type': 'item', imagePosition: 'left' })).toContain(
      'titleOnImage',
    );
    expect(
      titleFields({ '@type': 'item', imagePosition: 'none' }),
    ).not.toContain('titleOnImage');
    // the top image of cards has its own row with this setting
    expect(
      titleFields({ '@type': 'card', imagePosition: 'top' }),
    ).not.toContain('titleOnImage');
  });

  it('hides horizontal image positions in carousel and gallery', () => {
    ['cardsCarousel', 'cardsGallery'].forEach((variation) => {
      const schema = getItemModelSchema({
        variation,
        itemModel: { '@type': 'card' },
      });
      expect(
        schema.properties.imagePosition.choices.map(([value]) => value),
      ).toEqual(['top', 'none']);
    });
  });

  it('offers the title and logo mode in teasers only', () => {
    const modes = (formData) =>
      getItemModelSchema(formData).properties.contentMode.choices.map(
        ([value]) => value,
      );
    expect(
      modes({ '@type': 'teaser', itemModel: { '@type': 'card' } }),
    ).toContain('logo');
    expect(
      modes({
        '@type': 'listing',
        variation: 'cardsGallery',
        itemModel: { '@type': 'card' },
      }),
    ).not.toContain('logo');
    // kept where it is already used, e.g. a former "Image on bottom" listing
    expect(
      modes({
        '@type': 'listing',
        variation: 'cardsGallery',
        itemModel: { '@type': 'imageOnBottom' },
      }),
    ).toContain('logo');
  });

  it('reduces the card controls in title and logo mode', () => {
    const schema = getItemModelSchema({
      '@type': 'teaser',
      itemModel: { '@type': 'card', contentMode: 'logo' },
    });
    expect(fields(schema)).toEqual([
      '@type',
      'contentMode',
      'maxTitle',
      'hasTags',
      'callToAction',
    ]);
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

  it('keeps the side images of list items in carousels', () => {
    ['cardsCarousel'].forEach((variation) => {
      const schema = getItemModelSchema({
        variation,
        itemModel: { '@type': 'item', imagePosition: 'left' },
      });
      expect(
        schema.properties.imagePosition.choices.map(([value]) => value),
      ).toEqual(['left', 'right', 'none']);
    });
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
    expect(fields(schema)).toEqual([
      '@type',
      'size',
      'imagePosition',
      'elementsOrder',
    ]);
    expect(schema.properties.elementsOrder.widget).toBe('card_elements');
    expect(schema.properties.elementsOrder.elements.map(([id]) => id)).toEqual([
      'title',
      'date',
      'description',
      'contentType',
      'tags',
      'cta',
    ]);
    expect(
      schema.properties.elementsOrder.elementSettings.title.fields,
    ).toContain('icon');
    expect(
      schema.properties.elementsOrder.fieldSchemas['callToAction.label'],
    ).toBeDefined();
    expect(
      schema.properties.imagePosition.choices.map(([value]) => value),
    ).toEqual(['left', 'right', 'none']);
  });

  it('shows image and description options only when they apply', () => {
    const schema = getItemModelSchema({
      itemModel: {
        '@type': 'item',
        imagePosition: 'left',
        hasDescription: true,
      },
    });
    expect(fields(schema)).toEqual(
      expect.arrayContaining(['elementsOrder', 'hasLabel']),
    );
    const styles = fields(schema.properties.styles.schema);
    expect(styles).toEqual(
      expect.arrayContaining(['rounded:bool', 'objectFit', 'objectPosition']),
    );
  });

  it('keeps the compact list item to the title and content type', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'item', size: 'compact', imagePosition: 'left' },
    });
    expect(fields(schema)).toEqual(['@type', 'size', 'elementsOrder']);
    expect(schema.properties.elementsOrder.elements.map(([id]) => id)).toEqual([
      'title',
      'contentType',
    ]);
    const styles = fields(schema.properties.styles.schema);
    expect(styles).toContain('border:noprefix');
    expect(styles).not.toContain('rounded:bool');
    expect(styles).not.toContain('objectFit');
  });

  it('shows the publication date by default on new cards', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top' },
    });
    expect(schema.properties.hasDate.default).toBe(true);
    // a date switched off stays off
    const off = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top', hasDate: false },
    });
    expect(off.properties.hasDate.default).toBe(false);
  });

  it('uses the migrated values as defaults for legacy data', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'imageOnRight' },
    });
    expect(schema.properties.imagePosition.default).toBe('right');
    // the former card schema defaulted the date to off
    expect(schema.properties.hasDate.default).toBe(false);

    const itemSchema = getItemModelSchema({
      itemModel: { '@type': 'simpleItem' },
    });
    expect(fields(itemSchema)).toContain('size');
    expect(itemSchema.properties.size.default).toBe('compact');
    expect(itemSchema.properties.imagePosition.default).toBe('none');
  });

  it('offers a single border selector, with top accent only on cards', () => {
    const schema = (type) =>
      getItemModelSchema({
        itemModel: { '@type': type, imagePosition: 'top' },
      }).properties.styles.schema;
    const card = schema('card');
    expect(fields(card)).toContain('border:noprefix');
    expect(fields(card)).not.toContain('bordered:bool');
    expect(fields(card)).not.toContain('topAccent:bool');
    expect(
      card.properties['border:noprefix'].choices.map(([value]) => value),
    ).toEqual(['no-border', 'top-accent', 'bordered']);
    expect(
      schema('item').properties['border:noprefix'].choices.map(
        ([value]) => value,
      ),
    ).toEqual(['no-border', 'bordered']);
  });

  it('displays the existing border as the selector default', () => {
    const styleSchema = getItemModelSchema({
      itemModel: {
        '@type': 'card',
        imagePosition: 'top',
        styles: { 'topAccent:bool': true },
      },
    }).properties.styles.schema;
    expect(styleSchema.properties['border:noprefix'].default).toBe(
      'top-accent',
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
      'border:noprefix',
    );
  });

  it('offers flipping on vertical cards only', () => {
    expect(
      fields(
        getItemModelSchema({
          itemModel: { '@type': 'card', imagePosition: 'top' },
        }),
      ),
    ).toContain('flip');
    expect(
      fields(
        getItemModelSchema({
          itemModel: { '@type': 'card', imagePosition: 'left' },
        }),
      ),
    ).not.toContain('flip');
    expect(
      fields(
        getItemModelSchema({
          itemModel: { '@type': 'card', contentMode: 'overlay' },
        }),
      ),
    ).not.toContain('flip');
  });

  it('lets every element choose its side once flipping is on', () => {
    const settings = (itemModel) =>
      getItemModelSchema({ itemModel }).properties.elementsOrder
        .elementSettings;
    expect(
      settings({ '@type': 'card', imagePosition: 'top' }).title.fields,
    ).not.toContainEqual({ field: 'flipSides', key: 'title' });

    const schema = getItemModelSchema({
      itemModel: { '@type': 'card', imagePosition: 'top', flip: true },
    });
    const { elementSettings, fieldSchemas } = schema.properties.elementsOrder;
    Object.entries(elementSettings).forEach(([id, { fields: rowFields }]) => {
      expect(rowFields[0]).toEqual({ field: 'flipSides', key: id });
    });
    expect(fieldSchemas['flipSides.description'].default).toBe('back');
    expect(fieldSchemas['flipSides.title'].default).toBe('front');
    expect(fieldSchemas['flipSides.title'].choices.map(([v]) => v)).toEqual([
      'front',
      'back',
    ]);
  });

  it('allows up to 20 lines for the title and the description', () => {
    const schema = getItemModelSchema({
      itemModel: { '@type': 'item', imagePosition: 'left' },
    });
    expect(schema.properties.maxTitle.maximum).toBe(20);
    expect(schema.properties.maxDescription.maximum).toBe(20);
    expect(schema.properties.maxTitle.minimum).toBe(0);
  });

  describe('with card templates of other add-ons', () => {
    const reportsCard = {
      id: 'reports-card',
      isDefault: false,
      title: 'Reports Card',
      schemaEnhancer: ({ schema }) => {
        const itemModel = schema.properties.itemModel.schema;
        itemModel.fieldsets[0].fields.push('reportsOption');
        itemModel.properties.reportsOption = { title: 'Reports option' };
        return schema;
      },
    };
    let cardTemplates;

    beforeEach(() => {
      cardTemplates =
        config.blocks.blocksConfig.listing.extensions.cardTemplates;
      config.blocks.blocksConfig.listing.extensions.cardTemplates = [
        ...cardTemplates,
        reportsCard,
      ];
    });

    afterEach(() => {
      config.blocks.blocksConfig.listing.extensions.cardTemplates =
        cardTemplates;
    });

    it.each([
      ['summary', 'item', 'List item'],
      ['cardsGallery', 'card', 'Card'],
    ])('offers them next to the %s template', (variation, type, title) => {
      const schema = getItemModelSchema({ variation, itemModel: {} });
      expect(fields(schema)).toContain('@type');
      expect(schema.properties['@type'].choices).toEqual([
        [type, title],
        ['reports-card', 'Reports Card'],
      ]);
      expect(schema.properties['@type'].default).toBe(type);
    });

    it('keeps the selected template and its own controls', () => {
      const schema = getItemModelSchema({
        variation: 'summary',
        itemModel: { '@type': 'reports-card' },
      });
      expect(fields(schema)).toContain('@type');
      expect(fields(schema)).toContain('reportsOption');
    });
  });
});
