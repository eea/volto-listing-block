import CardsCarousel from './CardsCarousel';
import CustomCardsGalleryTemplate from './CustomCardsGalleryTemplate';
import CustomNewsListTemplate from './CustomNewsListTemplate';
import CustomSummaryListingBlockTemplate from './CustomSummaryListingBlockTemplate';
import { ListingStylingSchema } from './Schema';

const applyConfig = (config) => {
  config.blocks.blocksConfig.listing.variations = [
    ...config.blocks.blocksConfig.listing.variations,
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
  if (!config.blocks.blocksConfig.listing.enableStyling) {
    config.blocks.blocksConfig.listing.enableStyling = true;
    config.blocks.blocksConfig.listing.stylesSchema = ListingStylingSchema;
  }

  // moment date locale. See https://momentjs.com/ - Multiple Locale Support
  config.settings.dateLocale = config.settings.dateLocale || 'en';
  return config;
};

export default applyConfig;
