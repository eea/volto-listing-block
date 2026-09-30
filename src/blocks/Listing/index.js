import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';

import Carousel from './layout-templates/Carousel';
import Gallery from './layout-templates/Gallery';
import Listing from './layout-templates/Listing';
import {
  setCardModelSchema,
  setCardStylingSchema,
  setItemModelSchema,
} from './schema';

import CardTemplate from './item-templates/CardTemplate';
import ItemTemplate from './item-templates/ItemTemplate';

import withItemModelMigration from '@eeacms/volto-listing-block/components/UniversalCard/withItemModelMigration';
import messages from '@eeacms/volto-listing-block/messages';
import Accordion from './layout-templates/Accordion';
import {
  hideHiddenVariations,
  migrateListingData,
  withUnknownVariationFallback,
} from './variations';

const applyConfig = (config) => {
  // moment date locale. See https://momentjs.com/ - Multiple Locale Support
  config.settings.dateLocale = config.settings.dateLocale ?? 'en';
  const { listing } = config.blocks.blocksConfig;

  const blacklist = ['summary'];

  listing.schemaEnhancer = composeSchema(
    moveQueryToFieldset,
    listing.schemaEnhancer,
  );

  // The split of responsibilities is as follows:
  // the Listing block variation takes care of the Layout responsibility (how
  // the items are listed)
  // The variation takes care of how the individual item is displayed.
  // With our own variations being based on the UniversalCard, we have another
  // level of control on how each item is displayed.

  // Layouts offered to editors: List, Grid, Carousel and Accordion. How each
  // item looks (image position, overlay, top accent, compact...) is set with
  // the card controls, not with extra variations.
  listing.variations = [
    ...listing.variations
      .filter(({ id }) => blacklist.indexOf(id) === -1)
      // Volto's own templates stay available for existing blocks only
      .map((variation) => ({ ...variation, isDefault: false })),
    {
      id: 'summary',
      isDefault: true,
      title: 'List',
      template: Listing,
      schemaEnhancer: composeSchema(UniversalCard.schemaEnhancer),
    },
    {
      id: 'cardsGallery',
      isDefault: false,
      title: 'Grid',
      template: Gallery,
      schemaEnhancer: composeSchema(
        UniversalCard.schemaEnhancer,
        Gallery.schemaEnhancer,
      ),
    },
    {
      id: 'cardsCarousel',
      isDefault: false,
      title: 'Carousel',
      template: Carousel,
      schemaEnhancer: composeSchema(
        UniversalCard.schemaEnhancer,
        Carousel.schemaEnhancer,
      ),
    },
    {
      id: 'accordion',
      isDefault: false,
      title: 'Accordion',
      template: Accordion,
    },
    {
      // legacy: a Grid with the top accent card style, migrated on edit
      id: 'cardsVisualization',
      isDefault: false,
      title: 'Visualization Cards',
      template: Gallery,
      schemaEnhancer: composeSchema(
        UniversalCard.schemaEnhancer,
        Gallery.schemaEnhancer,
      ),
    },
  ].map((variation) => ({
    ...variation,
    schemaEnhancer: composeSchema(
      variation.schemaEnhancer,
      hideHiddenVariations,
    ),
  }));
  listing.edit = withItemModelMigration(listing.edit, migrateListingData);
  listing.view = withUnknownVariationFallback(listing.view);

  listing.extensions = {
    ...listing.extensions,
    // Only two base templates, all other card flavours (image position,
    // overlay, visualization preview, compact/search list items) are
    // controls of these. Legacy template ids are migrated, see
    // components/UniversalCard/migrate.js
    cardTemplates: [
      {
        id: 'card',
        isDefault: true,
        title: messages.cardTemplate,
        template: CardTemplate,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
      },
      {
        id: 'item',
        isDefault: false,
        title: messages.itemTemplate,
        template: ItemTemplate,
        schemaEnhancer: composeSchema(setItemModelSchema, setCardStylingSchema),
      },
    ],
  };

  return config;
};

export default applyConfig;

const moveQueryToFieldset = ({ schema, intl }) => {
  // NOTE: this is a schema finalizer

  // move querystring to its own fieldset;
  schema.fieldsets[0].fields = schema.fieldsets[0].fields.filter(
    (f) => f !== 'querystring',
  );
  schema.fieldsets.splice(1, 0, {
    id: 'querystring',
    title: intl.formatMessage(messages.query),
    fields: ['querystring'],
  });

  return schema;
};
