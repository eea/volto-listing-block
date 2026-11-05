import React from 'react';
import config from '@plone/volto/registry';
import {
  migrateItemModel,
  getLayoutItemModel,
  needsItemModelMigration,
} from '@eeacms/volto-listing-block/components/UniversalCard/migrate';

// Variations that are still registered, so existing blocks keep rendering,
// but are no longer offered in the variation select. Their layout is covered
// by List / Grid / Carousel together with the card controls.
export const HIDDEN_VARIATIONS = [
  'default',
  'imageGallery',
  'cardsVisualization',
];

// The fields offering the listing variations: the listing block variation
// and the results layout of the search block
const VARIATION_FIELDS = ['variation', 'listingBodyTemplate'];

/**
 * Schema enhancer that removes the hidden variations from the variation
 * selects of the listing and search blocks, except the ones in use.
 */
export const hideHiddenVariations = (args) => {
  const { schema } = args;
  // the search block passes its data as `data`
  const data = args.formData || args.data || {};
  const isOffered = (id, inUse) => !HIDDEN_VARIATIONS.includes(id) || inUse;

  VARIATION_FIELDS.forEach((name) => {
    const field = schema.properties?.[name];
    if (field?.choices) {
      field.choices = field.choices.filter(([id]) =>
        isOffered(id, id === data[name]),
      );
    }
  });

  // the views a search block lets its visitors switch to
  const views = schema.properties?.availableViews;
  if (views?.choices) {
    views.choices = views.choices.filter(([id]) =>
      isOffered(id, (data.availableViews || []).includes(id)),
    );
  }
  return schema;
};

// Volto's plain list, it was the default layout before List
export const LEGACY_DEFAULT_VARIATION = 'default';

/**
 * Blocks saved with a variation that is not registered (anymore) used to
 * fall back to Volto's default list. List is the default layout now, so keep
 * those blocks explicitly on the old default.
 */
export const keepUnknownVariationOnDefault = (data) => {
  const variations = config.blocks.blocksConfig.listing?.variations || [];
  const isUnknown =
    data?.variation &&
    variations.length > 0 &&
    !variations.some(({ id }) => id === data.variation);

  return isUnknown ? { ...data, variation: LEGACY_DEFAULT_VARIATION } : data;
};

// Legacy card templates the former List layout showed in a grid of cards
// (.card-items, .imageCard-items), not one below the other
const LEGACY_GRID_CARD_TYPES = ['card', 'imageCard'];

// That grid fit as many cards of at least 275px as the container allowed,
// three at container width. The stored gridSize was not used by List.
const LEGACY_GRID_SIZE = 'three';

/**
 * Blocks saved with the List layout and a legacy card template showing the
 * image on top rendered a grid of cards. List renders list items now, so keep
 * those blocks on the Grid layout.
 */
export const keepLegacyCardsOnGrid = (data, field = 'variation') => {
  const isLegacyCardGrid =
    data?.[field] === 'summary' &&
    LEGACY_GRID_CARD_TYPES.includes(data.itemModel?.['@type']) &&
    needsItemModelMigration(data.itemModel);

  return isLegacyCardGrid
    ? { ...data, [field]: 'cardsGallery', gridSize: LEGACY_GRID_SIZE }
    : data;
};

/**
 * Visualization Cards was a Grid with a top accent border and a drop shadow
 * on the cards. A shadow turned off explicitly stays off.
 */
export const keepVisualizationCardsOnGrid = (data, field = 'variation') => {
  if (data?.[field] !== 'cardsVisualization') return data;

  const styles = data.itemModel?.styles || {};
  return {
    ...data,
    [field]: 'cardsGallery',
    gridSize: data.gridSize || 'five',
    itemModel: {
      ...(data.itemModel || {}),
      styles: {
        ...styles,
        'topAccent:bool': true,
        'dropShadow:bool': styles['dropShadow:bool'] ?? true,
      },
    },
  };
};

// The former layouts covered by the Grid, applied by the edit migration and
// on the fly by the view, so blocks look the same before they are edited.
// The card schema is built for them too, so the block defaults match.
export const keepLegacyLayoutsOnGrid = (data, field = 'variation') =>
  keepVisualizationCardsOnGrid(keepLegacyCardsOnGrid(data, field), field);

export const withUnknownVariationFallback = (View) => {
  if (!View) return View;
  const WithUnknownVariationFallback = (props) =>
    React.createElement(View, {
      ...props,
      data: keepLegacyLayoutsOnGrid(keepUnknownVariationOnDefault(props.data)),
    });
  return WithUnknownVariationFallback;
};

/**
 * Search blocks without a results layout used Volto's default list, the
 * default listing variation before List.
 */
export const keepSearchLayoutOnDefault = (data) =>
  data && !data.listingBodyTemplate
    ? { ...data, listingBodyTemplate: LEGACY_DEFAULT_VARIATION }
    : data;

export const withSearchLayoutFallback = (View) => {
  if (!View) return View;
  const WithSearchLayoutFallback = (props) =>
    React.createElement(View, {
      ...props,
      data: keepLegacyLayoutsOnGrid(
        keepSearchLayoutOnDefault(props.data),
        'listingBodyTemplate',
      ),
    });
  return WithSearchLayoutFallback;
};

// The card model and the former Visualization Cards layout, for the field
// holding the layout (`variation` or `listingBodyTemplate`)
const migrateLayoutData = (data, field) => {
  // before the card model migration, it tells the legacy card templates apart
  let result = keepLegacyLayoutsOnGrid(data, field);

  const itemModel = migrateItemModel(result.itemModel);
  if (itemModel !== result.itemModel) {
    result = { ...result, itemModel };
  }

  const layoutModel = getLayoutItemModel(
    result.itemModel,
    result[field] || (field === 'variation' ? 'summary' : undefined),
  );
  return layoutModel === result.itemModel
    ? result
    : { ...result, itemModel: layoutModel };
};

/**
 * Migrates the listing block data to the consolidated layouts and card
 * model. Returns the same object when nothing needs to change.
 */
export const migrateListingData = (data) =>
  data && migrateLayoutData(keepUnknownVariationOnDefault(data), 'variation');

/**
 * Migrates the search block data: its results use the listing layouts.
 */
export const migrateSearchData = (data) =>
  data &&
  migrateLayoutData(keepSearchLayoutOnDefault(data), 'listingBodyTemplate');
