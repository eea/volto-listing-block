import { Button, Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { flattenToAppURL } from '@plone/volto/helpers';
import { Enlarge } from '@eeacms/volto-embed/Toolbar';
import React from 'react';
import RenderBlocksWrapper from './RenderBlocksWrapper';

const getCallToAction = (item, options) => {
  const { urlTemplate } = options;
  return urlTemplate
    ? urlTemplate
        .replace('$PORTAL_URL', config.settings.publicURL)
        .replace('$URL', flattenToAppURL(item['@id']))
    : options.href?.[0]?.['@id'] || item['@id'];
};

const CallToAction = ({ item, itemModel }) => {
  const url = getCallToAction(item, itemModel.callToAction);

  // Try different approaches to access _original

  // const result = { metadata: item?._original, location: { pathname: url } };
  const result = { location: { pathname: url } };
  return (
    <Button
      // as="a"
      // href={url}
      className={
        itemModel.styles?.['theme:noprefix']
          ? itemModel.styles?.['inverted:bool']
            ? itemModel.styles?.['theme:noprefix'] + ' inverted'
            : 'inverted'
          : 'tertiary inverted'
      }
    >
      {itemModel.callToAction.label || 'Read more'}
      <Enlarge>
        <RenderBlocksWrapper {...result} />
      </Enlarge>
    </Button>
  );
};

const Tag = ({ item }) => {
  const renderTag = config.blocks.blocksConfig.teaser.renderTag;
  return !!item?.Subject
    ? item.Subject.map((tag, i) => renderTag(tag, i))
    : null;
};

const CardExtra = ({ item, itemModel = {} }) => {
  const showCallToAction = itemModel?.callToAction?.enable;
  const showTags = itemModel.hasTags;
  const show = showCallToAction || showTags;

  return show ? (
    <UiCard.Content extra>
      {showTags && item?.Subject?.length > 0 && (
        <div className={'tags labels'}>
          <Tag item={item} />
        </div>
      )}
      {showCallToAction && <CallToAction item={item} itemModel={itemModel} />}
    </UiCard.Content>
  ) : null;
};

export default CardExtra;
