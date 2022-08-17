// import UniversalCard from './UniversalCard';

import {
  DefaultCardLayout,
  ImageCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
} from './Cards';

export default function applyConfig(config) {
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

  return config;
}
