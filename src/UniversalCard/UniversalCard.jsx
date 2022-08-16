import React from 'react';
import cx from 'classnames';

import { Card as UiCard } from 'semantic-ui-react';

import CardDescription from './CardDescription';
import CardExtra from './CardExtra';
import CardImage from './CardImage';
import CardMeta from './CardMeta';
import CardTitle from './CardTitle';

import schemaEnhancer from './schema';
import { Item } from './model';

const getStyles = (props) => {
  const { cardModel = {} } = props;
  const res = {};
  if (cardModel.maxDescription) {
    res[`max-${cardModel.maxDescription}-lines`] = true;
  }
  return res;
};

const BasicCard = (props) => {
  const { styles, className } = props;
  const item = new Item(props.item);
  const cardProps = { ...props, item };

  return (
    <UiCard
      fluid={true}
      className={cx('u-card', styles?.theme, getStyles(cardProps), {
        [className]: className,
      })}
    >
      <CardImage {...cardProps} />
      <UiCard.Content>
        <CardMeta {...cardProps} />
        <CardTitle {...cardProps} />
        <CardDescription {...cardProps} />
        <CardExtra {...props} />
      </UiCard.Content>
    </UiCard>
  );
};

export const defaultCardsRegistry = {
  _default: BasicCard,
};

const UniversalCard = ({ item, cardsRegistry, ...rest }) => {
  cardsRegistry = cardsRegistry || defaultCardsRegistry;

  const Card = cardsRegistry[item['@type']] || cardsRegistry['_default'];

  return <Card item={item} {...rest} />;
};

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
