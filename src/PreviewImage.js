// TODO: see if possible to replace with Volto's PreviewImage component
import React from 'react';

import { getImageScaleParams } from '@eeacms/volto-listing-block/helpers';
import { Image, Label } from 'semantic-ui-react';

import DefaultImageSVG from './default-image.svg';

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
  const params = preview_image?.[0]
    ? getImageScaleParams(preview_image?.[0], size)
    : item
    ? getImageScaleParams(item, size)
    : DefaultImageSVG;

  return (
    <>
      {label ? (
        <Label ribbon={label.side} color={label.color}>
          {label.text}
        </Label>
      ) : null}
      <Image
        src={preview_image_url || params?.download}
        alt={item.title}
        {...rest}
        width={params.width}
        height={params.height}
      />
    </>
  );
}

export default PreviewImage;
