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

/**
 * Tags and call to action. `parts` picks which of them to render, in order;
 * by default both, in the card footer. With `inline` they are rendered
 * without the footer wrapper, to be placed between the other card elements.
 */
const CardExtra = ({
  item,
  itemModel = {},
  isEditMode,
  parts = ['tags', 'cta'],
  inline = false,
}) => {
  const action = useCardAction();

  const rendered = parts
    .map((part) => {
      if (part === 'tags' && itemModel.hasTags && item?.Subject?.length > 0) {
        return (
          <div key={part} className={'tags labels'}>
            <Tag item={item} />
          </div>
        );
      }
      if (part === 'cta' && itemModel.callToAction?.enable) {
        return <CallToAction key={part} item={item} itemModel={itemModel} />;
      }
      return null;
    })
    .filter(Boolean);

  if (!rendered.length) return null;

  const content = inline ? (
    <div className="card-inline-extra">{rendered}</div>
  ) : (
    <UiCard.Content extra>{rendered}</UiCard.Content>
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
