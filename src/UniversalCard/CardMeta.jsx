import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { formatDate } from '@plone/volto/helpers/Utils/Date';

const CardMeta = (props) => {
  const { item, cardModel = {}, head_title } = props;
  const { EffectiveDate } = item;
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate = cardModel?.hasDate && EffectiveDate !== 'None';
  const showMeta = cardModel?.hasMetaType && item['@type'];
  const show = showDate || showMeta;

  return show ? (
    <UiCard.Meta>
      {showMeta && <span class="text-left">{head_title || item['@type']}</span>}
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

export default CardMeta;
