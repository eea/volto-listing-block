import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { Item as UiItem, Icon } from 'semantic-ui-react';
import { getFieldURL, setImageSize } from '@eeacms/volto-listing-block/helpers';
import { getContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers';

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
  const dispatch = useDispatch();

  useEffect(() => {
    if (imageUrl) {
      dispatch(getContent(flattenToAppURL(imageUrl), null, block));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const imageParams = useSelector(
    (state) => state.content.subrequests[block]?.data?.image,
  );

  const scaledImage = setImageSize(imageUrl, imageParams, imageSize);

  const image = getFieldURL(imageUrl);
  return (
    <UiItem.Group unstackable className="row">
      <UiItem className={cx(theme)}>
        {assetType === 'image' && image && (
          <UiItem.Image
            src={flattenToAppURL(scaledImage?.download)}
            className={cx('ui', imageSize, verticalAlign, 'aligned')}
            alt={header || 'Item image'}
            width={scaledImage?.width}
            height={scaledImage?.height}
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
