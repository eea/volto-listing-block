const CARD = 'card';
const ITEM = 'item';

// The parts of a card / list item that can be reordered from the sidebar.
export const IMAGE = 'image';
export const CONTENT_TYPE = 'contentType';
export const DATE = 'date';
export const TITLE = 'title';
export const BENCHMARK = 'benchmark';
export const DESCRIPTION = 'description';
export const TAGS = 'tags';
export const CTA = 'cta';

// Placed last, the tags and the call to action go to the card footer
export const FOOTER_ELEMENTS = [TAGS, CTA];

// The default order renders the card as it always did: image, metadata row
// (content type and date), title, benchmark level, description.
export const CARD_ELEMENTS = [
  IMAGE,
  CONTENT_TYPE,
  DATE,
  TITLE,
  BENCHMARK,
  DESCRIPTION,
  TAGS,
  CTA,
];

// The visualization card: content type above the title, date below it and
// the image at the bottom.
export const VISUALIZATION_ELEMENTS = [
  CONTENT_TYPE,
  TITLE,
  DATE,
  BENCHMARK,
  DESCRIPTION,
  IMAGE,
  TAGS,
  CTA,
];

// List items have the image on the side, so it is not part of the order
export const ITEM_ELEMENTS = [
  TITLE,
  DATE,
  DESCRIPTION,
  CONTENT_TYPE,
  TAGS,
  CTA,
];

// 'none' keeps the image in the list, so it can be switched back on
const isVerticalImage = (imagePosition) =>
  !imagePosition ||
  imagePosition === 'top' ||
  imagePosition === 'bottom' ||
  imagePosition === 'none';

/**
 * The elements that can be ordered for the given (migrated) itemModel.
 */
export const getAvailableElements = (itemModel = {}) => {
  if ((itemModel['@type'] ?? CARD) === ITEM) return ITEM_ELEMENTS;
  return isVerticalImage(itemModel.imagePosition)
    ? CARD_ELEMENTS
    : CARD_ELEMENTS.filter((id) => id !== IMAGE);
};

const getDefaultOrder = (itemModel = {}) => {
  if ((itemModel['@type'] ?? CARD) === ITEM) return ITEM_ELEMENTS;
  return itemModel.imagePosition === 'bottom'
    ? VISUALIZATION_ELEMENTS
    : CARD_ELEMENTS;
};

/**
 * The order of the elements: the stored `elementsOrder`, limited to the
 * available elements, with the missing ones appended in their default order.
 */
export const getElementsOrder = (itemModel = {}) => {
  const available = getAvailableElements(itemModel);
  const stored = Array.isArray(itemModel.elementsOrder)
    ? itemModel.elementsOrder
    : getDefaultOrder(itemModel);
  const order = stored.filter(
    (id, index) => available.includes(id) && stored.indexOf(id) === index,
  );

  return [
    ...order,
    ...getDefaultOrder(itemModel).filter(
      (id) => available.includes(id) && !order.includes(id),
    ),
  ];
};

/**
 * The elements that are in the order but currently not displayed, so the
 * sidebar can mark them.
 */
export const getHiddenElements = (itemModel = {}) =>
  [
    !itemModel.hasMetaType && CONTENT_TYPE,
    itemModel.hasDate === false && DATE,
    !itemModel.hasBenchmarkLevel && BENCHMARK,
    !itemModel.hasDescription && DESCRIPTION,
    itemModel.imagePosition === 'none' && IMAGE,
    !itemModel.hasTags && TAGS,
    !itemModel.callToAction?.enable && CTA,
  ].filter(Boolean);

/**
 * Splits the order into the body elements and the trailing tags / call to
 * action, which render in the card footer as they always did.
 */
export const splitFooter = (order) => {
  let index = order.length;
  while (index > 0 && FOOTER_ELEMENTS.includes(order[index - 1])) index--;
  return { body: order.slice(0, index), footer: order.slice(index) };
};
