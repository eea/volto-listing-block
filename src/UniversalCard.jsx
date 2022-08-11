import { Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { ConditionalLink } from '@plone/volto/components';
import { formatDate } from '@plone/volto/helpers/Utils/Date';
import PreviewImage from './PreviewImage';
import { truncate } from 'lodash';
import cx from 'classnames';

const BasicCard = ({
  item,
  isEditMode,
  hasDate,
  hasDescription,
  maxDescription,
  styles,
}) => {
  const { title, description, EffectiveDate } = item;
  const locale = config.settings.dateLocale || 'en-gb';

  return (
    <UiCard fluid={true} className={cx(styles?.theme)}>
      <ConditionalLink className="image" item={item} condition={!isEditMode}>
        <PreviewImage item={item} alt={item.title} />
      </ConditionalLink>
      <UiCard.Content>
        {hasDate && EffectiveDate !== 'None' && (
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
        )}
        {title && (
          <UiCard.Header>
            <ConditionalLink
              className="header-link"
              item={item}
              condition={!isEditMode}
            >
              {title}
            </ConditionalLink>
          </UiCard.Header>
        )}
        {hasDescription && description && (
          <UiCard.Description>
            {maxDescription
              ? truncate(description, {
                  length: maxDescription,
                  separator: ' ',
                })
              : description}
          </UiCard.Description>
        )}
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
