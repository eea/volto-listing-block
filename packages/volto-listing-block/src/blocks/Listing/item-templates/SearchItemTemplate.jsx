import cx from 'classnames';
import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';

const BodyText = ({ item, hasDescription }) => {
  return (
    <div className="listing-body">
      <h3 className={'listing-header'}>{item.title ? item.title : item.id}</h3>
      {hasDescription && (
        <p className={'listing-description'}>{item.description}</p>
      )}

      {item?.extra && <div className="slot-bottom">{item?.extra}</div>}
    </div>
  );
};

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

const BasicItem = (props) => {
  const { item, styles, className, itemModel = {} } = props;
  const { hasImage, hasDate, hasDescription, imageOnRightSide } = itemModel;

  return (
    <div
      className={cx(
        'u-item listing-item result-item',
        styles?.theme,
        getStyles(props),
        className,
      )}
    >
      <div
        className={`wrapper ${imageOnRightSide ? 'right-image' : 'left-image'}`}
      >
        <div className="slot-head">{item?.meta}</div>
        <div className="slot-top">
          {hasImage ? (
            imageOnRightSide ? (
              <>
                <BodyText
                  item={item}
                  hasDescription={hasDescription}
                  hasDate={hasDate}
                />
                <div className="image-wrapper">
                  <PreviewImage
                    item={item}
                    preview_image_url={item.preview_image_url}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="image-wrapper">
                  <PreviewImage
                    item={item}
                    preview_image_url={item.preview_image_url}
                  />
                </div>
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
        </div>
      </div>
    </div>
  );
};

export const SearchItemLayout = (props) => {
  return <BasicItem {...props} />;
};
