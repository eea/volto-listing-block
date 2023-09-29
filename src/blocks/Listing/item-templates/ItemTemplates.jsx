import cx from 'classnames';
import { ConditionalLink } from '@plone/volto/components';
import { Icon } from 'semantic-ui-react';

import { formatDate } from '@plone/volto/helpers/Utils/Date';
import { When } from '@plone/volto/components/theme/View/EventDatesInfo';

import config from '@plone/volto/registry';
import { getVoltoStyles } from '@eeacms/volto-listing-block/schema-utils';

import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';

const getStyles = (props) => {
  const { itemModel = {} } = props;
  const res = {};
  if (itemModel.maxDescription) {
    res[`max-${itemModel.maxDescription}-lines`] = true;
  }
  if (itemModel.maxTitle) {
    res[`title-max-${itemModel.maxTitle}-lines`] = true;
  }
  return res;
};

const Wrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const BodyText = ({ item, isEditMode, itemModel }) => {
  const { hasDate, hasEventDate, hasDescription, icon, hasIcon } = itemModel;
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate = hasDate !== false && item.EffectiveDate !== 'None';

  return (
    <div
      className={cx('listing-body', {
        'has-icon': icon ?? false,
      })}
    >
      {hasIcon && icon && <Icon className={icon} size="large" />}
      <Wrapper
        condition={icon}
        wrapper={(children) => <div className="listing-wrap">{children}</div>}
      >
        <ConditionalLink item={item} condition={!isEditMode}>
          <h3 className={'listing-header'}>
            {item.title ? item.title : item.id}
          </h3>
        </ConditionalLink>
        <div className="listing-body-dates">
          {showDate && (
            <p className={'listing-date'}>
              {formatDate({
                date: item.EffectiveDate,
                format: {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                },
                locale: locale,
              })}
            </p>
          )}
          {!!item.start && hasEventDate && (
            <span className="event-date">
              <Icon className="ri-calendar-line" />
              <When
                start={item.start}
                end={item.end}
                whole_day={true}
                open_end={item.open_end}
              />
            </span>
          )}
        </div>
        {hasDescription && (
          <p className={'listing-description'}>{item.description}</p>
        )}
      </Wrapper>
    </div>
  );
};

const BasicItem = (props) => {
  const { item, className, itemModel = {}, isEditMode = false } = props;
  const { hasImage, imageOnRightSide } = itemModel;
  const styles = getStyles(props);

  const bodyText = (
    <BodyText item={item} isEditMode={isEditMode} itemModel={itemModel} />
  );

  return (
    <div
      className={cx('u-item listing-item', getVoltoStyles(styles), className)}
    >
      <div
        className={`wrapper ${imageOnRightSide ? 'right-image' : 'left-image'}`}
      >
        <div className="slot-top">
          {hasImage ? (
            <>
              {imageOnRightSide ? bodyText : null}
              <div className="image-wrapper">
                <PreviewImage item={item} />
              </div>
              {!imageOnRightSide ? bodyText : null}
            </>
          ) : (
            bodyText
          )}
        </div>
        <div className="slot-bottom">{item?.extra}</div>
      </div>
    </div>
  );
};

export const DefaultItemLayout = (props) => {
  return <BasicItem {...props} />;
};
