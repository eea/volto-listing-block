import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import { formatDate } from '@plone/volto/helpers/Utils/Date';
import { When } from '@plone/volto/components/theme/View/EventDatesInfo';

import config from '@plone/volto/registry';
import { getVoltoStyles } from '@eeacms/volto-listing-block/schema-utils';
import {
  CardActionLink,
  CardExtra,
} from '@eeacms/volto-listing-block/components/UniversalCard';
import {
  getItemLabel,
  getMaxLinesClasses,
} from '@eeacms/volto-listing-block/components/UniversalCard/utils';

import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';
import {
  CONTENT_TYPE,
  CTA,
  DATE,
  DESCRIPTION,
  TAGS,
  TITLE,
  getElementsOrder,
  splitFooter,
} from '@eeacms/volto-listing-block/components/UniversalCard/elements';

const Wrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

// list items only support horizontal images
const getImagePosition = ({ imagePosition }) =>
  imagePosition === 'none' || imagePosition === 'right'
    ? imagePosition
    : imagePosition
      ? 'left'
      : 'none';

// `keepEmpty`: the default list item always rendered the dates container,
// which also gives its spacing below the title
const ItemDates = ({ item, itemModel, keepEmpty }) => {
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate =
    itemModel.hasDate && item.EffectiveDate && item.EffectiveDate !== 'None';
  const showEventDate = !!item.start && itemModel.hasEventDate;

  return showDate || showEventDate || keepEmpty ? (
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
      {showEventDate && (
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
  ) : null;
};

// `keepEmpty`: the compact item always rendered its meta container
const ItemContentType = ({ item, itemModel, keepEmpty }) =>
  itemModel.hasMetaType || keepEmpty ? (
    <div
      className={
        itemModel.size === 'compact' ? 'simple-item-meta' : 'item-meta'
      }
    >
      {itemModel.hasMetaType && (
        <span className="text-left">{item['type_title']}</span>
      )}
    </div>
  ) : null;

const ItemBody = ({ item, itemModel, order }) => {
  const { hasIcon, icon, hasDescription, hasHeadMeta, size } = itemModel;
  const isCompact = size === 'compact';
  const title = item.title ? item.title : item.id;
  const showIcon = !!(hasIcon && icon);
  const Header = size === 'compact' ? 'p' : 'h3';

  const elements = {
    [TITLE]:
      // already rendered with its own link (e.g. search results), or the
      // compact item links its whole body
      React.isValidElement(title) || isCompact ? (
        <Header className={'listing-header'}>{title}</Header>
      ) : (
        <CardActionLink>
          <Header className={'listing-header'}>{title}</Header>
        </CardActionLink>
      ),
    [DATE]: (
      <ItemDates
        item={item}
        itemModel={itemModel}
        keepEmpty={!isCompact && !hasHeadMeta}
      />
    ),
    [DESCRIPTION]: hasDescription && (
      <p className={'listing-description'}>{item.description}</p>
    ),
    // moved between the other elements, not at the bottom of the item
    [TAGS]: (
      <CardExtra item={item} itemModel={itemModel} parts={[TAGS]} inline />
    ),
    [CTA]: <CardExtra item={item} itemModel={itemModel} parts={[CTA]} inline />,
    [CONTENT_TYPE]: <ItemContentType item={item} itemModel={itemModel} />,
  };

  const body = (
    <div className={cx('listing-body', { 'has-icon': showIcon })}>
      {showIcon && <Icon className={icon} size="large" />}
      <Wrapper
        condition={showIcon}
        wrapper={(children) => <div className="listing-wrap">{children}</div>}
      >
        {order.map((id) => (
          <React.Fragment key={id}>{elements[id]}</React.Fragment>
        ))}
        {hasHeadMeta && item?.extra && (
          <div className="slot-bottom">{item.extra}</div>
        )}
      </Wrapper>
    </div>
  );

  // as the former simple item, the compact item links its whole body
  return isCompact && !React.isValidElement(title) ? (
    <CardActionLink>{body}</CardActionLink>
  ) : (
    body
  );
};

/**
 * The single list item template. Image side, compact size and the search
 * result head slot are driven by the itemModel controls.
 */
const ItemTemplate = (props) => {
  const { item, className, itemModel = {}, isEditMode = false } = props;
  const title = typeof item.title === 'string' ? item.title : item.Title;
  const { size, hasHeadMeta } = itemModel;
  const imagePosition = getImagePosition(itemModel);
  const isCompact = size === 'compact';

  const { body: order, footer } = splitFooter(
    // list items have a fixed order, the one of the former templates
    getElementsOrder({ ...itemModel, '@type': 'item', elementsOrder: null }),
  );
  // a content type placed last stays below the item, as it always did
  const trailingContentType = order[order.length - 1] === CONTENT_TYPE;
  const body = (
    <ItemBody
      item={item}
      itemModel={itemModel}
      order={trailingContentType ? order.slice(0, -1) : order}
    />
  );
  const image =
    imagePosition !== 'none' ? (
      <div className="image-wrapper">
        <CardActionLink>
          <PreviewImage
            item={item}
            preview_image={props.preview_image}
            preview_image_url={
              props.preview_image_url || item.preview_image_url
            }
            fallbacks={props.preview_image_fallbacks}
            alt={title || ''}
            label={getItemLabel(item, itemModel)}
          />
        </CardActionLink>
      </div>
    ) : null;

  return (
    <div
      className={cx(
        'u-item listing-item',
        {
          'simple-listing-item': isCompact,
          'result-item': hasHeadMeta,
        },
        getVoltoStyles(getMaxLinesClasses(itemModel)),
        className,
      )}
    >
      <div
        className={cx('wrapper', {
          // the former simple item had no image side
          'right-image': imagePosition === 'right',
          'left-image':
            imagePosition === 'left' ||
            (imagePosition === 'none' && !isCompact),
        })}
      >
        {hasHeadMeta && <div className="slot-head">{item?.meta}</div>}
        <div className="slot-top">
          {imagePosition === 'left' && image}
          {body}
          {imagePosition === 'right' && image}
        </div>
        {trailingContentType && (
          <ItemContentType
            item={item}
            itemModel={itemModel}
            keepEmpty={isCompact}
          />
        )}
        {!hasHeadMeta && !isCompact && (
          <div className="slot-bottom">{item?.extra}</div>
        )}
        <CardExtra
          item={item}
          itemModel={itemModel}
          isEditMode={isEditMode}
          parts={footer}
        />
      </div>
    </div>
  );
};

ItemTemplate.propTypes = {
  item: PropTypes.object.isRequired,
  itemModel: PropTypes.shape({
    imagePosition: PropTypes.oneOf(['left', 'right', 'none']),
    size: PropTypes.oneOf(['default', 'compact']),
    hasHeadMeta: PropTypes.bool,
    elementsOrder: PropTypes.arrayOf(PropTypes.string),
  }),
  className: PropTypes.string,
  isEditMode: PropTypes.bool,
};

export default ItemTemplate;
