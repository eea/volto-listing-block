import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';
import { ConditionalLink } from '@plone/volto/components';

const CardTitle = (props) => {
  const { item, isEditMode } = props;
  const { title, Title } = item;
  const t = title || Title;

  return t ? (
    <UiCard.Header>
      <ConditionalLink
        className="header-link"
        item={item}
        condition={!isEditMode}
      >
        {t}
      </ConditionalLink>
    </UiCard.Header>
  ) : null;
};

export default CardTitle;
