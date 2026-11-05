// TODO: see if possible to replace with Volto's PreviewImage component
import React from 'react';

import { Image, Label } from 'semantic-ui-react';

import DefaultImageSVG from './default-image.svg';
import { getImageScaleParams } from '@eeacms/volto-object-widget/helpers';

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
    fallbacks,
    ...rest
  } = props;
  // images to try, in order, when the current one fails to load
  const [failed, setFailed] = React.useState(0);
  const fallbackKey = (fallbacks || []).join('|');
  React.useEffect(() => setFailed(0), [preview_image_url, fallbackKey]);

  const candidates = preview_image_url
    ? [preview_image_url, ...(fallbacks || [])]
    : [];
  const src =
    (failed < candidates.length ? candidates[failed] : null) ||
    (preview_image?.[0]
      ? getImageScaleParams(preview_image, size).download
      : item.image_field
        ? getImageScaleParams(item, size).download
        : DefaultImageSVG);

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
        src={src}
        alt={item.title}
        {...rest}
        onError={(event) => {
          if (failed < candidates.length) setFailed(failed + 1);
          rest.onError?.(event);
        }}
      />
    </>
  );
}

export default PreviewImage;
