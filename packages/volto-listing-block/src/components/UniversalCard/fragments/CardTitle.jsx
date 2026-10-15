import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';

const CardTitle = (props) => {
  const { item, isEditMode, itemModel } = props;
  const { title, Title } = item;
  const t = title || Title;
  const to = item.external_link || item['@id'];

  return t && !itemModel?.titleOnImage ? (
    <UiCard.Header>
      <ConditionalLink
        className="header-link"
        to={to}
        item={item}
        condition={
          !!(
            !isEditMode &&
            itemModel?.hasLink &&
            itemModel?.['@type'] !== 'visualizationCard' &&
            !item.external_link &&
            to
          )
        }
      >
        {t}
      </ConditionalLink>
    </UiCard.Header>
  ) : null;
};

export default CardTitle;
