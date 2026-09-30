import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';
import cx from 'classnames';
import { buildStyleClassNamesFromData } from '@plone/volto/helpers/Blocks/Blocks';
import schemaEnhancer from './schema';
import { migrateItemModel } from './migrate';
import { getContentTypePreviewUrl } from './preview';
import { CardActionProvider } from './fragments/CardAction';

function UniversalCard(props) {
  const { item, itemModel: storedItemModel, ...rest } = props;
  const itemModel = migrateItemModel(storedItemModel || {});
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
  if (item && item['@id']?.indexOf('/@@download/file') !== -1) {
    item['@id'] = item['@id']?.replace('/@@download/file', '');
  }

  const CardTemplate = extension.template;

  // an explicit preview (e.g. resolved indicator preview, search thumbnail)
  // or a chosen preview image win over the content type based preview
  const preview_image_url =
    rest.preview_image_url ??
    (rest.preview_image?.[0] ? undefined : getContentTypePreviewUrl(item));

  return (
    <CardActionProvider
      item={item || {}}
      itemModel={itemModel}
      isEditMode={rest.isEditMode}
    >
      <CardTemplate
        item={new Item(item)}
        itemModel={itemModel}
        {...rest}
        preview_image_url={preview_image_url}
        className={cx([rest.className, ...hyphenClasses])}
      />
    </CardActionProvider>
  );
}

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
