import ItemEdit from './Edit';
import ItemView from './View';

import codeSVG from '@plone/volto/icons/code.svg';

const applyConfig = (config) => {
  config.blocks.blocksConfig.item = {
    id: 'item',
    title: 'Item',
    icon: codeSVG,
    group: 'common',
    edit: ItemEdit,
    view: ItemView,
    blockHasOwnFocusManagement: true,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    imageSizes: {
      tiny: { width: 24, height: 24 },
      small: { width: 48, height: 48 },
      medium: { width: 64, height: 64 },
      big: { width: 80, height: 80 },
      preview: { width: 400, height: 400 },
    },
    // add an icon prefix if you want to prefix the icon
    // for eea we use remix so we would add ri-
    iconPrefix: '',
    security: {
      addPermission: [],
      view: [],
    },
  };

  config.settings.blocksWithFootnotesSupport = {
    ...(config.settings.blocksWithFootnotesSupport || {}),
    item: ['description'],
  };

  return config;
};

export default applyConfig;
