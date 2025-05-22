import cx from 'classnames';
import { Item as UiItem, Icon } from 'semantic-ui-react';
import { getImageScaleParams } from '@eeacms/volto-object-widget/helpers';
import { getFieldURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

const ItemImage = ({ image, imageSize, verticalAlign }) => {
  const imageURL = getFieldURL(image);
  if (!imageURL) return null;
  const scaledImage = getImageScaleParams(imageURL, imageSize);
  const imageSizes = config.blocks.blocksConfig.item.imageSizes;
  const size = imageSizes[imageSize];

  return (
    <img
      src={scaledImage?.download}
      className={cx('ui image', imageSize, verticalAlign, 'aligned')}
      alt=""
      width={size.width}
      height={size.height}
      loading="lazy"
    />
  );
};

// add an icon prefix if you want to prefix the icon
// for eea we use remix so we would add ri-
export function getItemIconPrefix(icon) {
  const prefix = config.blocks?.blocksConfig?.item?.iconPrefix;
  if (!prefix) return icon;
  return icon.startsWith(prefix) ? icon : `${prefix}${icon}`;
}

function Item({
  assetType,
  children,
  description,
  extra,
  header,
  icon,
  iconSize = 'big',
  theme,
  verticalAlign,
  imageSize = 'big',
  meta,
  mode = 'view',
  block,
  image: imageUrl,
  ...props
}) {
  return (
    <UiItem.Group unstackable className="row">
      <UiItem className={cx(theme)}>
        {assetType === 'image' && (
          <ItemImage
            image={imageUrl}
            imageSize={imageSize}
            verticalAlign={verticalAlign}
          />
        )}
        {assetType === 'icon' && icon && (
          <Icon
            className={cx(
              getItemIconPrefix(icon),
              theme,
              verticalAlign,
              'aligned',
              {
                medium: iconSize === 'medium',
              },
            )}
            size={iconSize === 'medium' ? null : iconSize}
          />
        )}
        <UiItem.Content verticalAlign={verticalAlign}>
          {header && <UiItem.Header>{header}</UiItem.Header>}
          {meta && <UiItem.Meta>{meta}</UiItem.Meta>}
          {description && mode === 'view' && (
            <UiItem.Description>{description}</UiItem.Description>
          )}
          {mode === 'edit' && children}
          {extra && <UiItem.Extra>{extra}</UiItem.Extra>}
        </UiItem.Content>
      </UiItem>
    </UiItem.Group>
  );
}

export default Item;
