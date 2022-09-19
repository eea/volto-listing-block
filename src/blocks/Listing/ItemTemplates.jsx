import cx from 'classnames';
import { ConditionalLink, FormattedDate } from '@plone/volto/components';

import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';

const BodyText = ({ item, hasDate, hasDescription }) => {
  return (
    <div className="listing-body">
      <h3 className={'listing-header'}>{item.title ? item.title : item.id}</h3>
      {hasDate && item.effective && (
        <p className={'listing-date'}>
          <FormattedDate
            date={item.effective}
            format={{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }}
          />
        </p>
      )}
      {hasDescription && (
        <p className={'listing-description'}>{item.description}</p>
      )}
    </div>
  );
};

const getStyles = (props) => {
  const { itemModel = {} } = props;
  const res = {};
  if (itemModel.maxDescription) {
    res[`max-${itemModel.maxDescription}-lines`] = true;
  }
  return res;
};

const BasicItem = (props) => {
  const { item, styles, className, itemModel = {}, isEditMode = false } = props;
  const { hasImage, imageOnRightSide, hasDate, hasDescription } = itemModel;

  return (
    <div
      className={cx(
        'u-item listing-item',
        styles?.theme,
        getStyles(props),
        className,
      )}
    >
      <div className="wrapper">
        <div className="slot-top">
          <ConditionalLink item={item} condition={!isEditMode}>
            {hasImage ? (
              imageOnRightSide ? (
                <>
                  <BodyText
                    item={item}
                    hasDescription={hasDescription}
                    hasDate={hasDate}
                  />
                  <PreviewImage item={item} style={{ marginLeft: 'auto' }} />
                </>
              ) : (
                <>
                  <PreviewImage item={item} />
                  <BodyText
                    item={item}
                    hasDescription={hasDescription}
                    hasDate={hasDate}
                  />
                </>
              )
            ) : (
              <BodyText
                item={item}
                hasDescription={hasDescription}
                hasDate={hasDate}
              />
            )}
          </ConditionalLink>
        </div>
        <div className="slot-bottom">{item?.extra}</div>
      </div>
    </div>
  );
};

export const DefaultItemLayout = (props) => {
  return <BasicItem {...props} />;
};
