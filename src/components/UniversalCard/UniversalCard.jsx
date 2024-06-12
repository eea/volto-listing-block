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

  // we need to remove the @@download/file part of the url
  // to avoid missing image if we encounter a link to a file
  // which happens for anon users
  if (item && item['@id'].indexOf('@@download/file/') !== -1) {
    item['@id'] = item['@id'].replace('@@download/file/', '');
  }

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
