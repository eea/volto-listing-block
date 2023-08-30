import React from 'react';
import { ConditionalLink } from '@plone/volto/components';
import { Card } from 'semantic-ui-react';

import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';

const getLabel = (props) => {
  const { item, itemModel = {} } = props;
  const text = item.isNew ? 'New' : item.isExpired ? 'Archived' : null;

  return itemModel?.hasLabel && text
    ? {
        text,
        side: true,
        // TODO: set the colors from css?
        color: item.isExpired ? 'yellow' : 'green',
      }
    : null;
};

const CardTitleOnImage = (props) => {
  const { item, itemModel = {} } = props;
  return itemModel?.titleOnImage ? (
    <div className="gradient">
      <Card.Header>{item.title}</Card.Header>
    </div>
  ) : null;
};

const CardImage = (props) => {
  const { item, isEditMode, preview_image, itemModel } = props;
  const label = getLabel(props);
  const showLink = !isEditMode && itemModel?.hasLink && itemModel?.titleOnImage;

  return (
    <ConditionalLink className="image" item={item} condition={showLink}>
      {showLink ? (
        <>
          <PreviewImage
            item={item}
            preview_image={preview_image}
            alt={''}
            label={label}
          />
          <CardTitleOnImage {...props} />
        </>
      ) : (
        <div className={'image'}>
          <PreviewImage
            item={item}
            preview_image={preview_image}
            alt={item.title}
            label={label}
          />
          <CardTitleOnImage {...props} />
        </div>
      )}
    </ConditionalLink>
  );
};

export default CardImage;
