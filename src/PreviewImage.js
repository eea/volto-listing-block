// TODO: see if possible to replace with Volto's PreviewImage component
import React from 'react';

import { Image, Label } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';

import DefaultImageSVG from './default-image.svg';

const getSrc = (item, size) =>
  flattenToAppURL(
    `${item['@id']}/@@images/${item.image_field || 'image'}/${size}`,
  );

// TODO: do we still need volto-depiction compatibility?
// import DefaultImageSVG from '@plone/volto/components/manage/Blocks/Listing/default-image.svg';
// const makeImage = (item, style) => (
//   <img
//     style={style}
//     src={
//       item[settings.listingPreviewImageField]
//         ? flattenToAppURL(
//             item[settings.listingPreviewImageField].scales.preview.download,
//           )
//         : settings.depiction
//         ? flattenToAppURL(item['@id'] + settings.depiction)
//         : DefaultImageSVG
//     }
//     alt={item.title}
//   />
// );

/**
 * Renders a preview image for a catalog brain result item.
 *
 */
function PreviewImage(props) {
  const {
    item,
    preview_image_url,
    preview_image,
    size = 'preview',
    label,
    ...rest
  } = props;
  const src = preview_image?.[0]
    ? getSrc(preview_image[0], size)
    : item.image_field
    ? getSrc(item, size)
    : DefaultImageSVG;

  return (
    <>
      {label ? (
        <Label ribbon={label.side} color={label.color}>
          {label.text}
        </Label>
      ) : null}
      <Image
        decoding="async"
        loading="lazy"
        src={preview_image_url || src}
        alt={item.title}
        {...rest}
      />
    </>
  );
}

export default PreviewImage;
