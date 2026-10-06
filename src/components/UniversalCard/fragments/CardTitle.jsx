import React from 'react';
import { Card as UiCard } from 'semantic-ui-react';
import { CardActionLink } from './CardAction';

const CardTitle = (props) => {
  const { item, itemModel } = props;
  const { title, Title } = item;
  const t = title || Title;

  return t && !itemModel?.titleOnImage ? (
    <UiCard.Header>
      {React.isValidElement(t) ? (
        // already rendered with its own link (e.g. search results)
        t
      ) : (
        <CardActionLink className="header-link">{t}</CardActionLink>
      )}
    </UiCard.Header>
  ) : null;
};

export default CardTitle;
