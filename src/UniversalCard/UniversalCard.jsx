// import React from 'react';
import config from '@plone/volto/registry';
import { resolveExtension } from '@plone/volto/helpers/Extensions/withBlockExtensions';
import { Item } from './model';

import schemaEnhancer from './schema';

const UniversalCard = (props) => {
  const { cardModel, item, ...rest } = props;
  const extension = resolveExtension(
    '@type',
    config.blocks.blocksConfig.listing.extensions.cardTemplates,
    cardModel,
  );
  // const CardTemplate = BasicCard;
  const CardTemplate = extension.view;

  return <CardTemplate item={new Item(item)} cardModel={cardModel} {...rest} />;
};

UniversalCard.schemaEnhancer = schemaEnhancer;

export default UniversalCard;
