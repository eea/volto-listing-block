import React from 'react';
import { Button, Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { CardActionProvider, useCardAction } from './CardAction';

const getButtonClassName = (styles) => {
  const theme = styles?.['theme:noprefix'] || '';

  return styles?.['inverted:bool']
    ? theme
      ? `${theme} inverted`
      : 'basic black'
    : theme;
};

export const CallToAction = ({ itemModel }) => {
  const action = useCardAction();
  const className = getButtonClassName(itemModel.styles);
  const label = itemModel.callToAction?.label || 'Read more';

  return action && !action.disabled ? (
    <Button
      as={UniversalLink}
      href={action.url}
      onClick={action.onClick}
      openLinkInNewTab={false}
      className={className}
    >
      {label}
    </Button>
  ) : (
    <Button className={className}>{label}</Button>
  );
};

export const Tag = ({ item }) => {
  const renderTag = config.blocks.blocksConfig.teaser.renderTag;
  return !!item?.Subject
    ? item.Subject.map((tag, i) => renderTag(tag, i))
    : null;
};

const CardExtra = ({ item, itemModel = {}, isEditMode }) => {
  const showCallToAction = itemModel?.callToAction?.enable;
  const showTags = itemModel.hasTags;
  const show = showCallToAction || showTags;

  const action = useCardAction();

  if (!show) return null;

  const content = (
    <UiCard.Content extra>
      {showTags && item?.Subject?.length > 0 && (
        <div className={'tags labels'}>
          <Tag item={item} />
        </div>
      )}
      {showCallToAction && <CallToAction item={item} itemModel={itemModel} />}
    </UiCard.Content>
  );

  // used outside UniversalCard, provide the card action here
  return action ? (
    content
  ) : (
    <CardActionProvider
      item={item}
      itemModel={itemModel}
      isEditMode={isEditMode}
    >
      {content}
    </CardActionProvider>
  );
};

export default CardExtra;
