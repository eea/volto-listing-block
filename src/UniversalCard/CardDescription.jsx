import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';

const CardDescription = (props) => {
  const { item, cardModel = {}, description } = props;
  const { Description } = item;
  const { hasDescription } = cardModel;
  const desc = description || Description;
  const show = hasDescription && desc;

  return show ? <UiCard.Description content={desc} /> : null;
};

export default CardDescription;
