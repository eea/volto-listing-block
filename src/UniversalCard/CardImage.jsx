import React from 'react';
import { ConditionalLink } from '@plone/volto/components';

import PreviewImage from './../PreviewImage';

const getLabel = (props) => {
  // { text: 'new', side: 'left', color: 'green' }
  const { item, cardModel = {} } = props;
  const text = item.isNew ? 'New' : item.isExpired ? 'Archived' : null;

  return cardModel?.hasLabel && text
    ? {
        text,
        side: 'left',
        // TODO: set the colors from css?
        color: item.review_state === 'archived' ? 'yellow' : 'green',
      }
    : null;
};

const CardImage = (props) => {
  const { item, isEditMode, preview_image } = props;
  const label = getLabel(props);
  return (
    <ConditionalLink className="image" item={item} condition={!isEditMode}>
      <PreviewImage
        item={item}
        preview_image={preview_image}
        alt={item.title}
        label={label}
      />
    </ConditionalLink>
  );
};

export default CardImage;
