// TODO: see if possible to replace with Volto's PreviewImage component
import React from 'react';
import PropTypes from 'prop-types';

import { Image } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';

import DefaultImageSVG from './default-image.svg';

const getSrc = (item, size) =>
  flattenToAppURL(`${item['@id']}/@@images/${item.image_field}/${size}`);

/**
 * Renders a preview image for a catalog brain result item.
 *
 */
function PreviewImage(props) {
  const { item, preview_image, size = 'preview', label, ...rest } = props;
  const src = preview_image?.[0]
    ? getSrc(preview_image[0], size)
    : item.image_field
    ? getSrc(item, size)
    : DefaultImageSVG;

  return (
    <Image
      src={src}
      alt={item.title}
      {...rest}
      label={
        label
          ? {
              as: 'a',
              ribbon: label.side,
              content: label.text,
              color: label.color,
            }
          : null
      }
    />
  );
}

PreviewImage.propTypes = {
  size: PropTypes.string,
  item: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    image_field: PropTypes.string,
    title: PropTypes.string.isRequired,
  }),
};

export default PreviewImage;
