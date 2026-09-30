import React from 'react';
import { Card } from 'semantic-ui-react';

import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';
import { getItemLabel } from '../utils';
import { CardActionLink } from './CardAction';

const CardTitleOnImage = (props) => {
  const { item, itemModel = {} } = props;
  return itemModel?.titleOnImage ? (
    <div className="gradient">
      <Card.Header>{item.title}</Card.Header>
    </div>
  ) : null;
};

const CardImage = (props) => {
  const { item, preview_image, preview_image_url, itemModel } = props;
  const label = getItemLabel(item, itemModel);
  const title = typeof item.title === 'string' ? item.title : item.Title;

  // the image leads to the same destination as the title and the CTA
  return (
    <CardActionLink className="image" fallback="div">
      <PreviewImage
        item={item}
        preview_image={preview_image}
        preview_image_url={preview_image_url}
        alt={itemModel?.titleOnImage ? '' : title || ''}
        label={label}
      />
      <CardTitleOnImage {...props} />
    </CardActionLink>
  );
};

export default CardImage;
