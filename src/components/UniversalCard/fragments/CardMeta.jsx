import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { formatDate } from '@plone/volto/helpers/Utils/Date';

const CardMeta = (props) => {
  const { item, itemModel = {}, head_title } = props;
  const { EffectiveDate } = item;
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate =
    itemModel.hasDate !== false && !!EffectiveDate && EffectiveDate !== 'None';
  // the content type label, or the portal type without one (e.g. search
  // results only have the label)
  const contentType = item['type_title'] || item['@type'];
  const showMeta = !!(head_title || (itemModel?.hasMetaType && contentType));

  // TODO: <EEAFormattedDate data={EffectiveDate} />

  return showMeta || showDate ? (
    <UiCard.Meta>
      {showMeta && (
        <span className="text-left">{head_title || contentType}</span>
      )}

      {showDate && (
        <span className="text-right date">
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
