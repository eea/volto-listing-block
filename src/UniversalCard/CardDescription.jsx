import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';

const CardDescription = (props) => {
  const { item, cardModel = {} } = props;
  const { Description } = item;
  const { hasDescription } = cardModel;

  return hasDescription && Description ? (
    <UiCard.Description content={Description} />
  ) : null;
};

export default CardDescription;
