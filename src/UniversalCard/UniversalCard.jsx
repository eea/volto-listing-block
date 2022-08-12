import cx from 'classnames';
import { Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';

import { ConditionalLink } from '@plone/volto/components';
import { formatDate } from '@plone/volto/helpers/Utils/Date';

import PreviewImage from './../PreviewImage';
import schemaEnhancer from './schema';
import { Item } from './model';

const CardMeta = (props) => {
  const { item, cardModel = {} } = props;
  const { EffectiveDate } = item;
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate = cardModel?.hasDate && EffectiveDate !== 'None';
  const showMeta = cardModel?.hasMetaType && item['@type'];
  const show = showDate;

  return show ? (
    <UiCard.Meta>
      {showMeta && <span class="text-left">{item['@type']}</span>}
      {showDate && (
        <span class="text-right">
          {formatDate({
            date: EffectiveDate,
            format: {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            },
            locale: locale,
          })}
        </span>
      )}
    </UiCard.Meta>
  ) : null;
};

const CardTitle = (props) => {
  const { item, isEditMode } = props;
  const { title } = item;

  return title ? (
    <UiCard.Header>
      <ConditionalLink
        className="header-link"
        item={item}
        condition={!isEditMode}
      >
        {title}
      </ConditionalLink>
    </UiCard.Header>
  ) : null;
};

const CardDescription = (props) => {
  const { item, cardModel = {} } = props;
  const { Description } = item;
  const { hasDescription } = cardModel;

  return hasDescription && Description ? (
    <UiCard.Description content={Description} />
  ) : null;
};

const CardImage = ({ item, isEditMode, label }) => (
  <ConditionalLink className="image" item={item} condition={!isEditMode}>
    <PreviewImage item={item} alt={item.title} label={label} />
  </ConditionalLink>
);

// const CardExtra = ({ item }) => <UiCard.Content extra>extra</UiCard.Content>;

const getStyles = (props) => {
  const { cardModel = {} } = props;
  const res = {};
  if (cardModel.maxDescription) {
    res[`max-${cardModel.maxDescription}-lines`] = true;
  }
  return res;
};

const getLabel = (props) => {
  // { text: 'new', side: 'left', color: 'green' }
  const { item, cardModel = {} } = props;
  const text = item.isNew ? 'New' : item.isExpired ? 'Archived' : null;

  return cardModel?.hasLabel && text
    ? {
        text,
        side: 'left',
        color: item.review_state === 'archived' ? 'yellow' : 'green',
      }
    : null;
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
      <CardImage {...cardProps} label={getLabel(cardProps)} />
      <UiCard.Content>
        <CardMeta {...cardProps} />
        <CardTitle {...cardProps} />
        <CardDescription {...cardProps} />
        {/* <CardExtra {...props} /> */}
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
