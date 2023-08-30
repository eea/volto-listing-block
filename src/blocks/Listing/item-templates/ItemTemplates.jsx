import cx from 'classnames';
import { ConditionalLink } from '@plone/volto/components';

import { formatDate } from '@plone/volto/helpers/Utils/Date';

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

const BodyText = ({ item, hasDate, hasDescription, isEditMode }) => {
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate = hasDate !== false && item.EffectiveDate !== 'None';

  return (
    <div className="listing-body">
      <ConditionalLink item={item} condition={!isEditMode}>
        <h3 className={'listing-header'}>
          {item.title ? item.title : item.id}
        </h3>
      </ConditionalLink>
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
      {hasDescription && (
        <p className={'listing-description'}>{item.description}</p>
      )}
    </div>
  );
};

const BasicItem = (props) => {
  const { item, className, itemModel = {}, isEditMode = false } = props;
  const { hasImage, imageOnRightSide, hasDate, hasDescription } = itemModel;
  const styles = getStyles(props);

  return (
    <div
      className={cx('u-item listing-item', getVoltoStyles(styles), className)}
    >
      <div
        className={`wrapper ${imageOnRightSide ? 'right-image' : 'left-image'}`}
      >
        <div className="slot-top">
          {hasImage ? (
            imageOnRightSide ? (
              <>
                <BodyText
                  item={item}
                  hasDescription={hasDescription}
                  hasDate={hasDate}
                  isEditMode={isEditMode}
                />
                <div className="image-wrapper">
                  <PreviewImage item={item} />
                </div>
              </>
            ) : (
              <>
                <div className="image-wrapper">
                  <PreviewImage item={item} />
                </div>
                <BodyText
                  item={item}
                  hasDescription={hasDescription}
                  hasDate={hasDate}
                  isEditMode={isEditMode}
                />
              </>
            )
          ) : (
            <BodyText
              item={item}
              hasDescription={hasDescription}
              hasDate={hasDate}
              isEditMode={isEditMode}
            />
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
