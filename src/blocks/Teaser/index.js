import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';
import TeaserCardTemplate from './Card';
import { adjustTeaserSchema } from './schema';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';

export default (config) => {
  if (config.blocks.blocksConfig.teaser) {
    config.blocks.blocksConfig.teaser.schemaEnhancer = composeSchema(
      config.blocks.blocksConfig.teaser.schemaEnhancer,
      // addStyling,
      // setBasicStylingSchema,
    );

    config.blocks.blocksConfig.teaser.variations = [
      {
        id: 'card',
        isDefault: true,
        title: 'Card (top image)',
        template: TeaserCardTemplate,
        schemaEnhancer: composeSchema(
          adjustTeaserSchema,
          UniversalCard.schemaEnhancer,
        ),
      },
      // ...(config.blocks.blocksConfig.teaser.variations || []),
    ];
  }

  // Teaser Grid
  if (config.blocks.blocksConfig.teaserGrid) {
    config.blocks.blocksConfig.teaserGrid.title = 'Teaser (Cards)';
  }

  if (
    config.blocks.blocksConfig?.__grid?.blocksConfig?.teaser &&
    config.blocks.blocksConfig?.teaser
  ) {
    //because grid uses teaser from blocksConfig.__grid.blocksConfig.teaser
    //and we need that teaser overriden as well
    config.blocks.blocksConfig.__grid.blocksConfig.teaser =
      config.blocks.blocksConfig.teaser;
  }

  return config;
};
