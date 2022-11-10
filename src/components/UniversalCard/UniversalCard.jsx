import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';
import cx from 'classnames';

// import { getVoltoStyles } from '@eeacms/volto-listing-block/schema-utils';
import { buildStyleClassNamesFromData } from '@plone/volto/helpers';
//
import schemaEnhancer from './schema';

function UniversalCard(props) {
  const { itemModel = {}, item, ...rest } = props;
  const extension = resolveExtension(
    '@type',
    config.blocks.blocksConfig.listing.extensions.cardTemplates,
    itemModel,
  );
  const styles = buildStyleClassNamesFromData(itemModel.styles);

  const CardTemplate = extension.template;

  return (
    <CardTemplate
      item={new Item(item)}
      itemModel={itemModel}
      {...rest}
      className={cx([rest.className, ...styles])}
    />
  );
}

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
