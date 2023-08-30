import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';
import cx from 'classnames';
import { buildStyleClassNamesFromData } from '@plone/volto/helpers';
import schemaEnhancer from './schema';

function UniversalCard(props) {
  const { itemModel = {}, item, ...rest } = props;
  const extension = resolveExtension(
    '@type',
    config.blocks.blocksConfig.listing.extensions.cardTemplates,
    itemModel,
  );
  const styles = buildStyleClassNamesFromData(itemModel?.styles);

  // replace camelCase with hyphens ex objectFit -> object-fit
  const hyphenClasses = styles.map((className) =>
    className.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase(),
  );

  const CardTemplate = extension.template;

  return (
    <CardTemplate
      item={new Item(item)}
      itemModel={itemModel}
      {...rest}
      className={cx([rest.className, ...hyphenClasses])}
    />
  );
}

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
