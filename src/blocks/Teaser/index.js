import { composeSchema } from '@eeacms/volto-listing-block/schema-utils';
import { addStyling } from '@plone/volto/helpers';

import TeaserCardTemplate from './Card';
import { adjustTeaserSchema } from './schema';
import { setCardStylingSchema, setCardModelSchema } from '../Listing/schema';

export default (config) => {
  if (config.blocks.blocksConfig.teaser) {
    config.blocks.blocksConfig.teaser.variations = [
      {
        id: 'card',
        isDefault: true,
        title: 'Card (top image)',
        template: TeaserCardTemplate,
        schemaEnhancer: composeSchema(
          addStyling,
          adjustTeaserSchema,
          setCardStylingSchema,
          setCardModelSchema,
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
