import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';

import Carousel from './layout-templates/Carousel';
import Gallery from './layout-templates/Gallery';
import Listing from './layout-templates/Listing';
import {
  setCardModelSchema,
  setCardStylingSchema,
  setItemModelSchema,
  setSimpleItemModelSchema,
  setSimpleItemStylingSchema,
} from './schema';

import {
  DefaultCardLayout,
  ImageCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
} from './item-templates/CardTemplates';

import { DefaultItemLayout } from './item-templates/ItemTemplates';
import { SearchItemLayout } from './item-templates/SearchItemTemplate';
import { SimpleItemLayout } from './item-templates/SimpleItemTemplates';

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

  listing.variations = [
    ...listing.variations.filter(({ id }) => blacklist.indexOf(id) === -1),
    {
      id: 'summary',
      isDefault: false,
      title: 'Listing',
      template: Listing,
      schemaEnhancer: composeSchema(
        // addStyling,
        // setBasicStylingSchema,
        UniversalCard.schemaEnhancer,
      ),
    },
    {
      id: 'cardsCarousel',
      isDefault: false,
      title: 'Carousel',
      template: Carousel,
      schemaEnhancer: composeSchema(
        // addStyling,
        // setBasicStylingSchema,
        UniversalCard.schemaEnhancer,
        Carousel.schemaEnhancer,
      ),
    },
    {
      id: 'cardsGallery', //  'customCardsGalleryVariationId'
      isDefault: false,
      title: 'Gallery',
      template: Gallery,
      schemaEnhancer: composeSchema(
        // addStyling,
        // setBasicStylingSchema,
        UniversalCard.schemaEnhancer,
        Gallery.schemaEnhancer,
      ),
    },
  ];
  listing.extensions = {
    ...listing.extensions,
    cardTemplates: [
      {
        id: 'card',
        isDefault: true,
        title: 'Card (default)',
        template: DefaultCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
      },
      {
        id: 'imageCard',
        isDefault: false,
        title: 'Image Card',
        template: ImageCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
      },
      {
        id: 'imageOnLeft',
        isDefault: false,
        title: 'Image on left',
        template: LeftImageCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
        excludedFromVariations: ['cardsCarousel', 'cardsGallery'],
      },
      {
        id: 'imageOnRight',
        isDefault: false,
        title: 'Image on right',
        template: RightImageCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
        excludedFromVariations: ['cardsCarousel', 'cardsGallery'],
      },
      {
        id: 'item',
        isDefault: false,
        title: 'Listing Item',
        template: DefaultItemLayout,
        schemaEnhancer: composeSchema(setItemModelSchema, setCardStylingSchema),
        excludedFromVariations: ['cardsCarousel', 'cardsGallery'],
      },
      {
        id: 'searchItem',
        isDefault: false,
        title: 'Search Item',
        template: SearchItemLayout,
        schemaEnhancer: composeSchema(setItemModelSchema, setCardStylingSchema),
        excludedFromVariations: ['cardsCarousel', 'cardsGallery'],
      },
      {
        id: 'simpleItem',
        isDefault: false,
        title: 'Simple Item',
        template: SimpleItemLayout,
        schemaEnhancer: composeSchema(
          setSimpleItemModelSchema,
          setSimpleItemStylingSchema,
        ),
      },
    ],
  };

  return config;
};

export default applyConfig;

const moveQueryToFieldset = ({ schema }) => {
  // NOTE: this is a schema finalizer

  // move querystring to its own fieldset;
  schema.fieldsets[0].fields = schema.fieldsets[0].fields.filter(
    (f) => f !== 'querystring',
  );
  schema.fieldsets.splice(1, 0, {
    id: 'querystring',
    title: 'Query',
    fields: ['querystring'],
  });

  return schema;
};
