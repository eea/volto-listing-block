import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';

const CardDescription = (props) => {
  const { item, cardModel = {}, description } = props;
  const { Description } = item;
  const { hasDescription } = cardModel;
  const show = hasDescription ? !!Description : !!description;
  const desc = description || Description;

  return show ? <UiCard.Description content={desc} /> : null;
};

export default CardDescription;
