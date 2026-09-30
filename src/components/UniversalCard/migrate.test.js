import {
  getCardVariant,
  migrateItemModel,
  needsItemModelMigration,
} from './migrate';

describe('migrateItemModel', () => {
  it('returns current models unchanged', () => {
    const card = { '@type': 'card', imagePosition: 'left', hasDate: false };
    const item = { '@type': 'item', imagePosition: 'none' };
    expect(migrateItemModel(card)).toBe(card);
    expect(migrateItemModel(item)).toBe(item);
    expect(needsItemModelMigration(card)).toBe(false);
  });

  it('leaves unknown (third party) templates untouched', () => {
    const custom = { '@type': 'myTemplate', foo: 1 };
    expect(migrateItemModel(custom)).toBe(custom);
    expect(migrateItemModel(undefined)).toBe(undefined);
  });

  it('migrates the legacy default card', () => {
    expect(
      migrateItemModel({ '@type': 'card', hasDescription: true, maxTitle: 3 }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'card',
        imagePosition: 'top',
        contentMode: 'default',
        hasDate: true,
        hasDescription: true,
        maxTitle: 3,
      }),
    );
  });

  it('migrates image on left / right cards to imagePosition', () => {
    expect(migrateItemModel({ '@type': 'imageOnLeft' })).toEqual(
      expect.objectContaining({ '@type': 'card', imagePosition: 'left' }),
    );
    expect(
      migrateItemModel({ '@type': 'imageOnRight', imagePosition: 'top' }),
    ).toEqual(
      expect.objectContaining({ '@type': 'card', imagePosition: 'right' }),
    );
  });

  it('migrates the image card to the overlay content mode', () => {
    expect(
      migrateItemModel({ '@type': 'imageCard', titleOnImage: true }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'card',
        contentMode: 'overlay',
        titleOnImage: true,
      }),
    );
  });

  it('migrates the visualization card', () => {
    expect(
      migrateItemModel({
        '@type': 'visualizationCard',
        hasContentType: true,
        enableCTAPopup: true,
      }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'card',
        imagePosition: 'bottom',
        hasBenchmarkLevel: true,
        hasDate: true,
        hasMetaType: true,
        enableCTAPopup: true,
      }),
    );
  });

  it('migrates the legacy list item', () => {
    const migrated = migrateItemModel({
      '@type': 'item',
      hasImage: true,
      imageOnRightSide: true,
      hasIcon: true,
      icon: 'ri-home-line',
      hasTags: true,
      callToAction: { enable: true, label: 'Go' },
    });
    expect(migrated).toEqual(
      expect.objectContaining({
        '@type': 'item',
        imagePosition: 'right',
        size: 'default',
        hasHeadMeta: false,
        hasDate: true,
        hasIcon: true,
        icon: 'ri-home-line',
        hasTags: false,
        callToAction: { enable: false, label: 'Go' },
      }),
    );
    expect(migrated).not.toHaveProperty('hasImage');
    expect(migrated).not.toHaveProperty('imageOnRightSide');
  });

  it('migrates a legacy list item without image', () => {
    expect(migrateItemModel({ '@type': 'item' }).imagePosition).toBe('none');
  });

  it('migrates the search item', () => {
    expect(
      migrateItemModel({
        '@type': 'searchItem',
        hasImage: true,
        hasDescription: true,
      }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'item',
        imagePosition: 'left',
        hasHeadMeta: true,
        hasDate: false,
        hasDescription: true,
      }),
    );
  });

  it('migrates the simple item to the compact size', () => {
    expect(
      migrateItemModel({
        '@type': 'simpleItem',
        hasImage: true,
        hasDescription: true,
        hasMetaType: true,
      }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'item',
        imagePosition: 'none',
        size: 'compact',
        hasDescription: false,
        hasMetaType: true,
      }),
    );
  });

  it('keeps already stored new controls', () => {
    expect(
      migrateItemModel({ '@type': 'card', contentMode: 'overlay' }),
    ).toEqual(
      expect.objectContaining({
        imagePosition: 'top',
        contentMode: 'overlay',
      }),
    );
  });

  it('is idempotent', () => {
    [
      'card',
      'imageOnLeft',
      'imageOnRight',
      'imageCard',
      'visualizationCard',
      'item',
      'searchItem',
      'simpleItem',
    ].forEach((type) => {
      const once = migrateItemModel({ '@type': type, hasImage: true });
      expect(needsItemModelMigration(once)).toBe(false);
      expect(migrateItemModel(once)).toBe(once);
    });
  });
});

describe('getCardVariant', () => {
  it('maps every legacy template back to its variant', () => {
    [
      'card',
      'imageOnLeft',
      'imageOnRight',
      'imageCard',
      'visualizationCard',
      'item',
      'searchItem',
      'simpleItem',
    ].forEach((type) => {
      expect(getCardVariant(migrateItemModel({ '@type': type }))).toBe(type);
    });
  });

  it('defaults to card', () => {
    expect(getCardVariant({})).toBe('card');
  });
});
