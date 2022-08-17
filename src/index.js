import CardsCarousel from './CardsCarousel';
import CustomCardsGalleryTemplate from './CustomCardsGalleryTemplate';
import CustomNewsListTemplate from './CustomNewsListTemplate';
import CustomSummaryListingBlockTemplate from './CustomSummaryListingBlockTemplate';
import { ListingStylingSchema } from './Schema';

import './less/listing-cards.less';
import {
  DefaultCardLayout,
  ImageCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
} from './UniversalCard/Cards';

export { default as UniversalCard } from './UniversalCard';

const applyConfig = (config) => {
  const { listing } = config.blocks.blocksConfig;
  listing.extensions = {
    ...listing.extensions,
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

  listing.variations = [
    ...listing.variations,
    {
      id: 'cardsCarousel',
      isDefault: false,
      title: 'Cards carousel',
      template: CardsCarousel,
      schemaEnhancer: CardsCarousel.schemaEnhancer,
    },
    {
      id: 'customSummaryVariationId',
      isDefault: false,
      title: 'Custom summary',
      template: CustomSummaryListingBlockTemplate,
      schemaEnhancer: CustomSummaryListingBlockTemplate.schemaEnhancer,
    },
    {
      id: 'customCardsGalleryVariationId',
      isDefault: false,
      title: 'Custom cards gallery',
      template: CustomCardsGalleryTemplate,
      schemaEnhancer: CustomCardsGalleryTemplate.schemaEnhancer,
    },
    {
      id: 'customNewsListVariationId',
      isDefault: false,
      title: 'Custom news list',
      template: CustomNewsListTemplate,
      schemaEnhancer: CustomNewsListTemplate.schemaEnhancer,
    },
  ];

  // Theming
  if (!listing.enableStyling) {
    listing.enableStyling = true;
    listing.stylesSchema = ListingStylingSchema;
  }

  // moment date locale. See https://momentjs.com/ - Multiple Locale Support
  config.settings.dateLocale = config.settings.dateLocale || 'en';
  return config;
};

export default applyConfig;
