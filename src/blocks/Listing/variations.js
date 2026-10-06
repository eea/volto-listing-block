import React from 'react';
import config from '@plone/volto/registry';
import { migrateItemModel } from '@eeacms/volto-listing-block/components/UniversalCard/migrate';

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

export const withUnknownVariationFallback = (View) => {
  if (!View) return View;
  const WithUnknownVariationFallback = (props) =>
    React.createElement(View, {
      ...props,
      data: keepUnknownVariationOnDefault(props.data),
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
      data: keepSearchLayoutOnDefault(props.data),
    });
  return WithSearchLayoutFallback;
};

// The card model and the former Visualization Cards layout, for the field
// holding the layout (`variation` or `listingBodyTemplate`)
const migrateLayoutData = (data, field) => {
  let result = data;

  const itemModel = migrateItemModel(result.itemModel);
  if (itemModel !== result.itemModel) {
    result = { ...result, itemModel };
  }

  // Visualization Cards was a grid with a top accent border on the cards
  if (result[field] === 'cardsVisualization') {
    result = {
      ...result,
      [field]: 'cardsGallery',
      gridSize: result.gridSize || 'five',
      itemModel: {
        ...(result.itemModel || {}),
        styles: {
          ...(result.itemModel?.styles || {}),
          'topAccent:bool': true,
        },
      },
    };
  }

  return result;
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
