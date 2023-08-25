import cx from 'classnames';
import { Item as UiItem, Icon } from 'semantic-ui-react';
import { getFieldURL } from '@eeacms/volto-listing-block/helpers';
import messages from '@eeacms/volto-listing-block/messages';

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
  ...props
}) {
  const image = getFieldURL(props.image);
  return (
    <UiItem.Group unstackable className="row">
      <UiItem className={cx(theme)}>
        {assetType === 'image' && image && (
          <UiItem.Image
            src={`${image}/@@images/image/${imageSize}`}
            className={cx('ui', imageSize, verticalAlign, 'aligned')}
            alt={header || intl.formatMessage(messages.ItemImage)}
          />
        )}
        {assetType === 'icon' && icon && (
          <Icon
            className={cx(icon, theme, verticalAlign, 'aligned', {
              medium: iconSize === 'medium' ?? false,
            })}
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
