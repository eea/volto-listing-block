import cx from 'classnames';
import messages from '@eeacms/volto-listing-block/messages';
import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';

const BodyText = ({ item, hasDescription }) => {
  return (
    <div className="listing-body">
      <h3 className={'listing-header'}>{item.title ? item.title : item.id}</h3>
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
  const { item, styles, className, itemModel = {} } = props;
  const { hasImage, hasDate, hasDescription } = itemModel;

  return (
    <div
      className={cx(
        'u-item listing-item result-item',
        styles?.theme,
        getStyles(props),
        className,
      )}
    >
      <div className="wrapper">
        <div className="slot-head">{item?.meta}</div>
        <div className="slot-top">
          <BodyText
            item={item}
            hasDescription={hasDescription}
            hasDate={hasDate}
          />
          {hasImage && (
            <PreviewImage
              item={item}
              style={{ marginLeft: 'auto' }}
              preview_image_url={item.preview_image_url}
            />
          )}
        </div>
        <div className="slot-bottom">{item?.extra}</div>
      </div>
    </div>
  );
};

export const SearchItemLayout = (props) => {
  return <BasicItem {...props} />;
};
SearchItemLayout.styleSchemaEnhancer = ({ schema, intl }) => {
  // const styleSchema = schema.properties.styles.schema;
  const styleSchema = schema;
  styleSchema.fieldsets[0].fields.push('rounded');
  styleSchema.properties = {
    ...styleSchema.properties,
    rounded: {
      title: intl.formatMessage(messages.Rounded),
      description: intl.formatMessage(messages.RoundedHelp),
      type: 'boolean',
    },
  };
  return schema;
};
