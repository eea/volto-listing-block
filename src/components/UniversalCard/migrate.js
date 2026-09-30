import omit from 'lodash/omit';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';

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
const NEW_FIELDS = ['contentMode', 'hasBenchmarkLevel', 'size', 'hasHeadMeta'];

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
  visualizationCard: (m) => ({
    ...cardDefaults,
    imagePosition: 'bottom',
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

  const derived = LEGACY_TEMPLATES[itemModel['@type']](itemModel);
  return {
    ...omit(itemModel, LEGACY_FIELDS),
    ...derived,
    ...pickBy(pick(itemModel, NEW_FIELDS), (value) => value !== undefined),
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
    if (itemModel.imagePosition === 'left') return 'imageOnLeft';
    if (itemModel.imagePosition === 'right') return 'imageOnRight';
    if (itemModel.imagePosition === 'bottom') return 'visualizationCard';
    return CARD;
  }
  if (type === ITEM) {
    if (itemModel.size === 'compact') return 'simpleItem';
    if (itemModel.hasHeadMeta) return 'searchItem';
    return ITEM;
  }
  return type;
};
