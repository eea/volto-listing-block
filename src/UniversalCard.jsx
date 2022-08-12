import { Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { ConditionalLink } from '@plone/volto/components';
import { formatDate } from '@plone/volto/helpers/Utils/Date';
import PreviewImage from './PreviewImage';
import { truncate } from 'lodash';
import cx from 'classnames';

const CardMetaDate = (props) => {
  const { item, hasDate } = props;
  const { EffectiveDate } = item;
  const locale = config.settings.dateLocale || 'en-gb';

  return hasDate && EffectiveDate !== 'None' ? (
    <UiCard.Meta>
      {formatDate({
        date: EffectiveDate,
        format: {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        },
        locale: locale,
      })}
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
  const { item, hasDescription, maxDescription } = props;
  const { description } = item;

  return hasDescription && description ? (
    <UiCard.Description>
      {maxDescription
        ? truncate(description, {
            length: maxDescription,
            separator: ' ',
          })
        : description}
    </UiCard.Description>
  ) : null;
};

const CardImage = ({ item, isEditMode }) => (
  <ConditionalLink className="image" item={item} condition={!isEditMode}>
    <PreviewImage item={item} alt={item.title} />
  </ConditionalLink>
);

const BasicCard = (props) => {
  const { styles } = props;

  return (
    <UiCard fluid={true} className={cx(styles?.theme)}>
      <CardImage {...props} />
      <UiCard.Content>
        <CardMetaDate {...props} />
        <CardTitle {...props} />
        <CardDescription {...props} />
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

export default UniversalCard;
