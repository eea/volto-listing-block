import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { Card as UiCard, Icon } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { formatDate } from '@plone/volto/helpers/Utils/Date';

import {
  CardDescription,
  CardExtra,
  CardImage,
  CardMeta,
  CardTitle,
} from '@eeacms/volto-listing-block/components/UniversalCard';
import { getMaxLinesClasses } from '@eeacms/volto-listing-block/components/UniversalCard/utils';
import useBenchmarkLevels from '@eeacms/volto-listing-block/components/UniversalCard/useBenchmarkLevels';

import '@eeacms/volto-listing-block/less/visualization-cards.less';

export const CardBenchmarkLevel = ({ item }) => {
  const benchmarkLevelItems = useBenchmarkLevels();
  const benchmarkLevel = item?.['benchmark_level']?.[0];
  const benchmarkLevelItem = benchmarkLevelItems?.find(
    ({ value }) => value === benchmarkLevel,
  );

  return (
    <div className="benchmark_level_wrapper">
      <div className={`metadata benchmark_level ${benchmarkLevel ?? -1}`}>
        &nbsp;
      </div>
      {benchmarkLevelItem?.label}
    </div>
  );
};

CardBenchmarkLevel.propTypes = {
  item: PropTypes.shape({
    benchmark_level: PropTypes.arrayOf(PropTypes.string),
  }),
};

// With the image at the bottom (visualization cards) the content type goes
// above the title and the publishing date below it.
const CardContentType = ({ item, itemModel }) => {
  const contentType = item.type_title || item['@type'];
  return itemModel.hasMetaType && contentType ? (
    <UiCard.Meta className="content-type">{contentType}</UiCard.Meta>
  ) : null;
};

const CardPublishingDate = ({ item, itemModel }) => {
  const { EffectiveDate } = item;
  return itemModel.hasDate !== false &&
    EffectiveDate &&
    EffectiveDate !== 'None' ? (
    <UiCard.Meta className="publishing-date">
      <time dateTime={EffectiveDate}>
        {formatDate({
          date: EffectiveDate,
          format: {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          },
          locale: config.settings.dateLocale || 'en-gb',
        })}
      </time>
    </UiCard.Meta>
  ) : null;
};

/**
 * The single card template. Image position, overlay mode and the displayed
 * metadata are all driven by the itemModel controls.
 */
const CardTemplate = (props) => {
  const { className, item, itemModel = {} } = props;
  const {
    imagePosition = 'top',
    contentMode,
    hasBenchmarkLevel,
    hasIcon,
    icon,
  } = itemModel;

  // the preview image is picked by content type in UniversalCard
  const image = <CardImage {...props} />;
  const classes = cx('u-card', getMaxLinesClasses(itemModel), className);

  if (contentMode === 'overlay') {
    return (
      <UiCard fluid={true} className={classes}>
        {image}
      </UiCard>
    );
  }

  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
  const isBottom = imagePosition === 'bottom';

  return (
    <UiCard
      fluid={true}
      className={cx(classes, {
        'item-card': isHorizontal,
        'left-image-card': imagePosition === 'left',
        'right-image-card': imagePosition === 'right',
      })}
    >
      {(imagePosition === 'top' || imagePosition === 'left') && image}
      <UiCard.Content>
        {isBottom ? (
          <CardContentType item={item} itemModel={itemModel} />
        ) : (
          <CardMeta {...props} />
        )}
        {hasIcon && icon && <Icon className={icon} size="large" />}
        <CardTitle {...props} />
        {isBottom && <CardPublishingDate item={item} itemModel={itemModel} />}
        {hasBenchmarkLevel && <CardBenchmarkLevel item={item} />}
        <CardDescription {...props} />
        {isBottom && image}
      </UiCard.Content>
      {imagePosition === 'right' && image}
      <CardExtra {...props} />
    </UiCard>
  );
};

CardTemplate.propTypes = {
  item: PropTypes.object.isRequired,
  itemModel: PropTypes.shape({
    imagePosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'none']),
    contentMode: PropTypes.oneOf(['default', 'overlay']),
    hasBenchmarkLevel: PropTypes.bool,
  }),
  className: PropTypes.string,
  preview_image_url: PropTypes.string,
};

export default CardTemplate;
