import React, { useContext } from 'react';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import CardActionContext from './CardActionContext';

const CardActionLink = ({ children, item, isEditMode, ...rest }) => {
  const action = useContext(CardActionContext);

  if (action) {
    return action.disabled ? (
      children
    ) : (
      <a href={action.url} onClick={action.onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <ConditionalLink
      to={item['@id']}
      item={item}
      condition={!!(!isEditMode && item['@id'])}
      {...rest}
    >
      {children}
    </ConditionalLink>
  );
};

export default CardActionLink;
