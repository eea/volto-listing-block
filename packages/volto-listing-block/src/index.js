import { compose } from 'redux';

import installItemBlock from './blocks/Item';
import customizeTeaserBlock from './blocks/Teaser';
import customizeListingBlock from './blocks/Listing';

import './less/listing-cards.less';

export { default as UniversalCard } from './components/UniversalCard/UniversalCard';

const applyConfig = (config) => {
  // moment date locale. See https://momentjs.com/ - Multiple Locale Support
  config.settings.dateLocale = config.settings.dateLocale || 'en';
  return compose(
    installItemBlock,
    customizeListingBlock,
    customizeTeaserBlock,
  )(config);
};

export default applyConfig;
