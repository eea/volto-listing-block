import { addStyling } from '@plone/volto/helpers';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';

import Carousel from './layout-templates/Carousel';
import Gallery from './layout-templates/Gallery';
import Listing from './layout-templates/Listing';
import {
  setBasicStylingSchema,
  setCardStylingSchema,
  setCardModelSchema,
  setItemModelSchema,
} from './schema';

import {
  DefaultCardLayout,
  ImageCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
} from './item-templates/CardTemplates';

import { DefaultItemLayout } from './item-templates/ItemTemplates';
import { SearchItemLayout } from './item-templates/SearchItemTemplate';

const applyConfig = (config) => {
  // moment date locale. See https://momentjs.com/ - Multiple Locale Support
  config.settings.dateLocale = config.settings.dateLocale ?? 'en';
  const { listing } = config.blocks.blocksConfig;

  const blacklist = ['summary'];

  listing.schemaEnhancer = moveQueryToFieldset(listing.schemaEnhancer);

  // The split of responsibilities is as follows:
  // the Listing block variation takes care of the Layout responsibility (how
  // the items are listed)
  // The variation takes care of how the individual item is displayed.
  // With our own variations being based on the UniversalCard, we have another
  // level of control on how each item is displayed.
  // console.log(
  //   composeSchema(
  //     addStyling,
  //     setBasicStylingSchema,
  //     UniversalCard.schemaEnhancer,
  //   ),
  // );

  listing.variations = [
    ...listing.variations.filter(({ id }) => blacklist.indexOf(id) === -1),
    {
      id: 'summary',
      isDefault: false,
      title: 'Listing',
      template: Listing,
      schemaEnhancer: composeSchema(
        addStyling,
        setBasicStylingSchema,
        UniversalCard.schemaEnhancer,
      ),
    },
    {
      id: 'cardsCarousel',
      isDefault: false,
      title: 'Carousel',
      template: Carousel,
      // schemaEnhancer: compose(
      //   addStyling,
      //   setBasicStylingSchema,
      //   UniversalCard.schemaEnhancer,
      //   Carousel.schemaEnhancer,
      // ),
    },
    {
      id: 'cardsGallery', //  'customCardsGalleryVariationId'
      isDefault: false,
      title: 'Gallery',
      template: Gallery,
      // schemaEnhancer: compose(
      //   addStyling,
      //   setBasicStylingSchema,
      //   UniversalCard.schemaEnhancer,
      //   Gallery.schemaEnhancer,
      // ),
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
        title: 'Image Card',
        template: ImageCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
      },
      {
        id: 'imageOnLeft',
        title: 'Image on left',
        template: LeftImageCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
      },
      {
        id: 'imageOnRight',
        title: 'Image on right',
        template: RightImageCardLayout,
        schemaEnhancer: composeSchema(setCardModelSchema, setCardStylingSchema),
      },
      {
        id: 'item',
        isDefault: true,
        title: 'Listing Item',
        template: DefaultItemLayout,
        schemaEnhancer: composeSchema(setItemModelSchema, setCardStylingSchema),
      },
      {
        id: 'searchItem',
        isDefault: false,
        title: 'Search Item',
        template: SearchItemLayout,
        schemaEnhancer: composeSchema(setItemModelSchema, setCardStylingSchema),
      },
    ],
  };

  return config;
};

export default applyConfig;

const moveQueryToFieldset = (schemaEnhancer) => (props) => {
  // NOTE: this is a schema finalizer
  const schema = schemaEnhancer ? schemaEnhancer(props) : props.schema;

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

// import { CardStylingSchemaEnhancer } from '../schema';
// CardsCarousel.styleSchemaEnhancer = ({ schema, intl }) => {
//   return CardStylingSchemaEnhancer({ schema });
// };

// Listing.schemaEnhancer = UniversalItem.schemaEnhancer;
//
// Listing.styleSchemaEnhancer = ({ schema, intl }) => {
//   return schema;
// };
// listing.stylesSchema = BasicListingBlockStylesSchema;
// stylesSchema: Summary.styleSchemaEnhancer,
// stylesSchema: CardStylingSchemaEnhancer,
// stylesSchema: CardsCarousel.styleSchemaEnhancer,
// stylesSchema: SearchItemLayout.styleSchemaEnhancer,
// {
//   id: 'customNewsListVariationId',
//   isDefault: false,
//   title: 'News List',
//   template: NewsList,
//   // schemaEnhancer: NewsList.schemaEnhancer,
// },
// Theming
// This bug needs to be fixed first: https://github.com/plone/volto/issues/3675
// listing.enableStyling = true;
// import NewsList from './templates/NewsList';
