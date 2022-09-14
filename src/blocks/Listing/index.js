import CardsCarousel from './templates/CardsCarousel';
import CustomCardsGalleryTemplate from './templates/CardsGallery';
import CustomNewsListTemplate from './templates/NewsList';
import CustomSummaryListingBlockTemplate from './templates/Summary';
import {
  DefaultCardLayout,
  ImageCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
} from './CardTemplates';
import { DefaultItemLayout } from './ItemTemplates';

import { ListingStylingSchema } from './schema';

const applyConfig = (config) => {
  // moment date locale. See https://momentjs.com/ - Multiple Locale Support
  config.settings.dateLocale = config.settings.dateLocale || 'en';
  const { listing } = config.blocks.blocksConfig;

  const blacklist = ['summary'];

  const { schemaEnhancer } = listing;

  listing.schemaEnhancer = (props) => {
    const schema = schemaEnhancer ? schemaEnhancer(props) : props.schema;
    //
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

  listing.variations = [
    ...listing.variations.filter(({ id }) => blacklist.indexOf(id) === -1),
    {
      id: 'summary',
      isDefault: false,
      title: 'Item listing',
      template: CustomSummaryListingBlockTemplate,
      schemaEnhancer: CustomSummaryListingBlockTemplate.schemaEnhancer,
    },
    {
      id: 'cardsCarousel',
      isDefault: false,
      title: 'Cards carousel',
      template: CardsCarousel,
      schemaEnhancer: CardsCarousel.schemaEnhancer,
    },
    {
      id: 'customCardsGalleryVariationId',
      isDefault: false,
      title: 'Cards gallery',
      template: CustomCardsGalleryTemplate,
      schemaEnhancer: CustomCardsGalleryTemplate.schemaEnhancer,
    },
    {
      id: 'customNewsListVariationId',
      isDefault: false,
      title: 'News List',
      template: CustomNewsListTemplate,
      schemaEnhancer: CustomNewsListTemplate.schemaEnhancer,
    },
  ];

  listing.extensions = {
    ...listing.extensions,
    itemTemplates: [
      {
        id: 'item',
        isDefault: true,
        title: 'Basic Item',
        view: DefaultItemLayout,
      },
    ],
    cardTemplates: [
      {
        id: 'card',
        isDefault: true,
        title: 'Card (default)',
        view: DefaultCardLayout,
      },
      {
        id: 'imageCard',
        title: 'Image Card',
        view: ImageCardLayout,
      },
      {
        id: 'imageOnLeft',
        title: 'Image on left',
        view: LeftImageCardLayout,
      },
      {
        id: 'imageOnRight',
        title: 'Image on right',
        view: RightImageCardLayout,
      },
    ],
  };

  // Theming
  if (!listing.enableStyling) {
    listing.enableStyling = true;
    listing.stylesSchema = ListingStylingSchema;
  }

  return config;
};

export default applyConfig;
