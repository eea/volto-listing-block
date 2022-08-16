// import React from 'react';
import cx from 'classnames';

import { Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';

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

const UniversalCard = ({ item, cardModel, ...rest }) => {
  const extension = resolveExtension(
    '@type',
    cardModel,
    config.blocks.blocksConfig.listing.extensions.cardTemplates,
  );
  const CardTemplate = extension.view;

  return <CardTemplate item={item} cardModel={cardModel} {...rest} />;
};

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
