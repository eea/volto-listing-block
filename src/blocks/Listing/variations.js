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

/**
 * Schema enhancer that removes the hidden variations from the variation
 * select, except the one currently in use.
 */
export const hideHiddenVariations = ({ schema, formData }) => {
  const field = schema.properties?.variation;
  if (field?.choices) {
    field.choices = field.choices.filter(
      ([id]) => !HIDDEN_VARIATIONS.includes(id) || id === formData?.variation,
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
 * Migrates the listing block data to the consolidated layouts and card
 * model. Returns the same object when nothing needs to change.
 */
export const migrateListingData = (data) => {
  if (!data) return data;
  let result = keepUnknownVariationOnDefault(data);

  const itemModel = migrateItemModel(result.itemModel);
  if (itemModel !== result.itemModel) {
    result = { ...result, itemModel };
  }

  // Visualization Cards was a grid with a top accent border on the cards
  if (data.variation === 'cardsVisualization') {
    result = {
      ...result,
      variation: 'cardsGallery',
      gridSize: data.gridSize || 'five',
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
