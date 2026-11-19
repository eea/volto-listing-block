import React from 'react';
import { Card as UiCard, Icon } from 'semantic-ui-react';
import { When } from '@plone/volto/components/theme/View/EventDatesInfo';

const CardDescription = (props) => {
  const { item, itemModel = {}, description } = props;
  const { Description } = item;
  const { hasDescription, hasEventDate } = itemModel;
  const desc = description || Description;
  const show = hasDescription && desc;

  return (
    <>
      {!!item.start && hasEventDate && (
        <div className="listing-body-dates">
          <span className="event-date">
            <Icon className="ri-calendar-line" />
            <When
              start={item.start}
              end={item.end}
              whole_day={true}
              open_end={item.open_end}
            />
          </span>
        </div>
      )}
      {show ? <UiCard.Description content={desc} /> : null}
    </>
  );
};

export default CardDescription;
