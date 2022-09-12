import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';

import schemaEnhancer from './schema';

const UniversalItem = (props) => {
  const { itemModel = {}, item, ...rest } = props;
  const extension = resolveExtension(
    '@type',
    config.blocks.blocksConfig.listing.extensions.itemTemplates,
    itemModel,
  );
  const ItemTemplate = extension.view;

  return <ItemTemplate item={new Item(item)} itemModel={itemModel} {...rest} />;
};

UniversalItem.schemaEnhancer = schemaEnhancer;

export default UniversalItem;
