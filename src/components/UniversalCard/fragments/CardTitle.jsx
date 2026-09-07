import React, { useContext } from 'react';
import CardActionContext from './CardActionContext';
import { Card as UiCard } from 'semantic-ui-react';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';

const CardTitle = (props) => {
  const action = useContext(CardActionContext);
  const { item, isEditMode, itemModel } = props;
  const { title, Title } = item;
  const t = title || Title;

  return t && !itemModel?.titleOnImage ? (
    <UiCard.Header>
      {action && !action.disabled ? (
        <a className="header-link" href={action.url} onClick={action.onClick}>
          {t}
        </a>
      ) : (
        <ConditionalLink
          className="header-link"
          to={item['@id']}
          item={item}
          condition={
            !!(
              !isEditMode &&
              itemModel?.hasLink &&
              itemModel?.['@type'] !== 'visualizationCard' &&
              item['@id']
            )
          }
        >
          {t}
        </ConditionalLink>
      )}
    </UiCard.Header>
  ) : null;
};

export default CardTitle;
