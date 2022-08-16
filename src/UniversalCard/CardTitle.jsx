import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';
import { ConditionalLink } from '@plone/volto/components';

const CardTitle = (props) => {
  const { item, isEditMode } = props;
  const { title } = item;

  return title ? (
    <UiCard.Header>
      <ConditionalLink
        className="header-link"
        item={item}
        condition={!isEditMode}
      >
        {title}
      </ConditionalLink>
    </UiCard.Header>
  ) : null;
};

export default CardTitle;
