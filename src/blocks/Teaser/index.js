import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';
import { addStyling } from '@plone/volto/helpers';

import TeaserCardTemplate from './Card';
import { adjustTeaserSchema } from './schema';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import {
  // setCardStylingSchema,
  // setCardModelSchema,
  setBasicStylingSchema,
} from '../Listing/schema';

export default (config) => {
  if (config.blocks.blocksConfig.teaser) {
    config.blocks.blocksConfig.teaser.schemaEnhancer = composeSchema(
      config.blocks.blocksConfig.teaser.schemaEnhancer,
      addStyling,
      setBasicStylingSchema,
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
          // setCardModelSchema,
          // setCardStylingSchema,
        ),
      },
      // ...(config.blocks.blocksConfig.teaser.variations || []),
    ];
  }

  // Teaser Grid
  if (config.blocks.blocksConfig.teaserGrid) {
    config.blocks.blocksConfig.teaserGrid.title = 'Teaser (Cards)';
  }

  return config;
};
