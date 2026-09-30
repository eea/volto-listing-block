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

const Wrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

// list items only support horizontal images
const getImagePosition = ({ imagePosition }) =>
  imagePosition === 'none' || imagePosition === 'right'
    ? imagePosition
    : imagePosition
      ? 'left'
      : 'none';

const ItemDates = ({ item, itemModel }) => {
  const locale = config.settings.dateLocale || 'en-gb';
  const showDate =
    itemModel.hasDate && item.EffectiveDate && item.EffectiveDate !== 'None';
  const showEventDate = !!item.start && itemModel.hasEventDate;

  return showDate || showEventDate ? (
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

const ItemBody = ({ item, itemModel }) => {
  const { hasIcon, icon, hasDescription, hasHeadMeta, size } = itemModel;
  const title = item.title ? item.title : item.id;
  const showIcon = !!(hasIcon && icon);
  const Header = size === 'compact' ? 'p' : 'h3';

  return (
    <div className={cx('listing-body', { 'has-icon': showIcon })}>
      {showIcon && <Icon className={icon} size="large" />}
      <Wrapper
        condition={showIcon}
        wrapper={(children) => <div className="listing-wrap">{children}</div>}
      >
        {React.isValidElement(title) ? (
          // already rendered with its own link (e.g. search results)
          <Header className={'listing-header'}>{title}</Header>
        ) : (
          <CardActionLink>
            <Header className={'listing-header'}>{title}</Header>
          </CardActionLink>
        )}
        <ItemDates item={item} itemModel={itemModel} />
        {hasDescription && (
          <p className={'listing-description'}>{item.description}</p>
        )}
        {hasHeadMeta && item?.extra && (
          <div className="slot-bottom">{item.extra}</div>
        )}
      </Wrapper>
    </div>
  );
};

/**
 * The single list item template. Image side, compact size and the search
 * result head slot are driven by the itemModel controls.
 */
const ItemTemplate = (props) => {
  const { item, className, itemModel = {}, isEditMode = false } = props;
  const title = typeof item.title === 'string' ? item.title : item.Title;
  const { size, hasHeadMeta, hasMetaType } = itemModel;
  const imagePosition = getImagePosition(itemModel);
  const isCompact = size === 'compact';

  const body = <ItemBody item={item} itemModel={itemModel} />;
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
        className={`wrapper ${
          imagePosition === 'right' ? 'right-image' : 'left-image'
        }`}
      >
        {hasHeadMeta && <div className="slot-head">{item?.meta}</div>}
        <div className="slot-top">
          {imagePosition === 'left' && image}
          {body}
          {imagePosition === 'right' && image}
        </div>
        {hasMetaType && (
          <div className={cx('item-meta', { 'simple-item-meta': isCompact })}>
            <span className="text-left">{item['type_title']}</span>
          </div>
        )}
        {!hasHeadMeta && !isCompact && (
          <div className="slot-bottom">{item?.extra}</div>
        )}
        <CardExtra item={item} itemModel={itemModel} isEditMode={isEditMode} />
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
  }),
  className: PropTypes.string,
  isEditMode: PropTypes.bool,
};

export default ItemTemplate;
