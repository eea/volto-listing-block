import omit from 'lodash/omit';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import { VISUALIZATION_ELEMENTS } from './elements';

// The card templates are reduced to two base templates. Everything that used
// to be a separate template is now expressed through itemModel controls.
export const CARD = 'card';
export const ITEM = 'item';

// Layout variations where horizontal (left/right) images are not offered
export const NO_HORIZONTAL_IMAGE_VARIATIONS = ['cardsCarousel', 'cardsGallery'];

// Fields that belong to the pre-consolidation data model
const LEGACY_FIELDS = ['hasImage', 'imageOnRightSide', 'hasContentType'];

// Controls introduced by the consolidation. When already stored they are
// kept, so partially migrated data is not reset.
const NEW_FIELDS = [
  'contentMode',
  'hasBenchmarkLevel',
  'size',
  'hasHeadMeta',
  'elementsOrder',
];

// Volto filled the fields missing from the saved data with the defaults of
// the schema of the former template, when rendering. Apply them before the
// conversion, so missing fields render as they did.
const legacyCardDefaults = {
  titleOnImage: false,
  hasLink: true,
  hasDate: false,
  hasEventDate: false,
  maxTitle: 2,
  maxDescription: 2,
  callToAction: { label: 'Read more' },
};
const legacyItemDefaults = {
  hasEventDate: false,
  hasDescription: true,
  maxTitle: 2,
  maxDescription: 2,
  hasImage: true,
  hasIcon: false,
};
const LEGACY_DEFAULTS = {
  card: legacyCardDefaults,
  imageCard: legacyCardDefaults,
  imageOnLeft: legacyCardDefaults,
  imageOnRight: legacyCardDefaults,
  imageOnBottom: legacyCardDefaults,
  visualizationCard: {
    hasDescription: false,
    maxTitle: 4,
    maxDescription: 4,
    enableCTAPopup: true,
    callToAction: { enable: true, label: 'More info', urlTemplate: '$URL' },
  },
  item: legacyItemDefaults,
  searchItem: legacyItemDefaults,
  simpleItem: { maxTitle: 2 },
};

const isSet = (value) => value !== undefined;

const withLegacyDefaults = (itemModel) => {
  const defaults = LEGACY_DEFAULTS[itemModel['@type']] || {};
  return {
    ...defaults,
    ...pickBy(itemModel, isSet),
    ...(defaults.callToAction
      ? {
          callToAction: {
            ...defaults.callToAction,
            ...pickBy(itemModel.callToAction || {}, isSet),
          },
        }
      : {}),
  };
};

const showDate = (m) => m.hasDate !== false;

const itemImagePosition = (m) =>
  m.hasImage ? (m.imageOnRightSide ? 'right' : 'left') : 'none';

// Controls that the legacy list item templates did not render
const itemIgnoredControls = (m) => ({
  titleOnImage: false,
  hasMetaType: false,
  hasTags: false,
  hasLabel: false,
  callToAction: { ...(m.callToAction || {}), enable: false },
});

const cardDefaults = {
  '@type': CARD,
  imagePosition: 'top',
  contentMode: 'default',
  hasBenchmarkLevel: false,
  hasIcon: false,
};

const itemDefaults = {
  '@type': ITEM,
  size: 'default',
  hasHeadMeta: false,
};

// Each legacy template id maps to the base template plus the control values
// that reproduce what the legacy template rendered.
const LEGACY_TEMPLATES = {
  card: (m) => ({ ...cardDefaults, hasDate: showDate(m) }),
  imageOnLeft: (m) => ({
    ...cardDefaults,
    imagePosition: 'left',
    hasDate: showDate(m),
  }),
  imageOnRight: (m) => ({
    ...cardDefaults,
    imagePosition: 'right',
    hasDate: showDate(m),
  }),
  imageCard: (m) => ({
    ...cardDefaults,
    contentMode: 'overlay',
    hasDate: showDate(m),
  }),
  // "Image on bottom" (10.1.0): the title on top and the logo below it
  imageOnBottom: (m) => ({
    ...cardDefaults,
    contentMode: 'logo',
    hasDate: showDate(m),
  }),
  visualizationCard: (m) => ({
    ...cardDefaults,
    // image at the bottom, content type above and date below the title
    elementsOrder: VISUALIZATION_ELEMENTS,
    hasBenchmarkLevel: true,
    hasDate: showDate(m),
    // "Display content type" of the visualization card
    hasMetaType: m.hasMetaType ?? m.hasContentType,
  }),
  item: (m) => ({
    ...itemIgnoredControls(m),
    ...itemDefaults,
    imagePosition: itemImagePosition(m),
    hasDate: showDate(m),
  }),
  searchItem: (m) => ({
    ...itemIgnoredControls(m),
    ...itemDefaults,
    imagePosition: itemImagePosition(m),
    hasHeadMeta: true,
    hasIcon: false,
    hasDate: false,
    hasEventDate: false,
  }),
  simpleItem: (m) => ({
    ...itemIgnoredControls(m),
    ...itemDefaults,
    imagePosition: 'none',
    size: 'compact',
    hasIcon: false,
    hasMetaType: !!m.hasMetaType,
    hasDate: false,
    hasEventDate: false,
    hasDescription: false,
  }),
};

// `card` and `item` are both legacy and current ids. Current data always has
// an imagePosition, legacy data never does.
export const needsItemModelMigration = (itemModel) => {
  const type = itemModel?.['@type'];
  if (!type || !LEGACY_TEMPLATES[type]) return false;
  if (type === CARD || type === ITEM) return itemModel.imagePosition == null;
  return true;
};

/**
 * Converts an itemModel stored with one of the legacy card template ids to
 * the consolidated (card / item + controls) model. Current models and
 * templates registered by third parties are returned unchanged.
 */
export const migrateItemModel = (itemModel) => {
  if (!needsItemModelMigration(itemModel)) return itemModel;

  const legacy = withLegacyDefaults(itemModel);
  const derived = LEGACY_TEMPLATES[itemModel['@type']](legacy);
  return {
    ...omit(legacy, LEGACY_FIELDS),
    ...derived,
    ...pickBy(pick(itemModel, NEW_FIELDS), isSet),
  };
};

/**
 * Returns the legacy template id matching a (migrated) itemModel. It keeps
 * the CSS hooks (`.<id>-items`) used by the listing layout and the theme.
 */
export const getCardVariant = (itemModel = {}) => {
  const type = itemModel['@type'] ?? CARD;
  if (type === CARD) {
    if (itemModel.contentMode === 'overlay') return 'imageCard';
    if (itemModel.contentMode === 'logo') return 'imageOnBottom';
    if (itemModel.imagePosition === 'left') return 'imageOnLeft';
    if (itemModel.imagePosition === 'right') return 'imageOnRight';
    return CARD;
  }
  if (type === ITEM) {
    if (itemModel.size === 'compact') return 'simpleItem';
    if (itemModel.hasHeadMeta) return 'searchItem';
    return ITEM;
  }
  return type;
};
