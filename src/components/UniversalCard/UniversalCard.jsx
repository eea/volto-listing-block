import cx from 'classnames';

import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';

import { getVoltoStyles } from '@eeacms/volto-listing-block/schema-utils';
import schemaEnhancer from './schema';

const UniversalCard = (props) => {
  const { itemModel = {}, styles, item, ...rest } = props;
  const extension = resolveExtension(
    '@type',
    config.blocks.blocksConfig.listing.extensions.cardTemplates,
    itemModel,
  );
  // const CardTemplate = BasicCard;
  const CardTemplate = extension.view;
  const classNames = getVoltoStyles(styles);

  return (
    <CardTemplate
      className={cx(classNames)}
      item={new Item(item)}
      itemModel={itemModel}
      styles={styles}
      {...rest}
    />
  );
};

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
