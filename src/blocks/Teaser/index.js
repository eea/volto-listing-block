import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';
import TeaserCardTemplate from './Card';
import { adjustTeaserSchema } from './schema';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { Label } from 'semantic-ui-react';
import React from 'react';

const applyConfig = (config) => {
  if (config.blocks.blocksConfig.teaser) {
    config.blocks.blocksConfig.teaser.restricted = false;
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
  if (config.blocks.blocksConfig.gridBlock) {
    config.blocks.blocksConfig.gridBlock.title = 'Teaser (Cards)';
    config.blocks.blocksConfig.gridBlock.allowedBlocks = ['teaser'];
  }

  if (
    config.blocks.blocksConfig?.gridBlock?.blocksConfig.teaser &&
    config.blocks.blocksConfig?.teaser
  ) {
    //because grid uses teaser from blocksConfig.__grid.blocksConfig.teaser
    //and we need that teaser overriden as well
    config.blocks.blocksConfig.gridBlock.blocksConfig.teaser =
      config.blocks.blocksConfig.teaser;
  }

  config.blocks.blocksConfig.teaser.renderTag = (tag, index) => {
    return <Label key={index}>{tag}</Label>;
  };
  config.blocks.blocksConfig.teaserGrid = config.blocks.blocksConfig.gridBlock;
  return config;
};

export default applyConfig;
