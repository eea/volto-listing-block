import cx from 'classnames';

import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';

import { getVoltoStyles } from '@eeacms/volto-listing-block/schema-utils';
import schemaEnhancer from './schema';

const UniversalCard = (props) => {
  const { cardModel = {}, styles, item, ...rest } = props;
  const extension = resolveExtension(
    '@type',
    config.blocks.blocksConfig.listing.extensions.cardTemplates,
    cardModel,
  );
  // const CardTemplate = BasicCard;
  const CardTemplate = extension.view;
  const classNames = getVoltoStyles(styles);

  return (
    <CardTemplate
      className={cx(classNames)}
      item={new Item(item)}
      cardModel={cardModel}
      {...rest}
    />
  );
};

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
