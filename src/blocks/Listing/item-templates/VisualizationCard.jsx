import cx from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import config from '@plone/volto/registry';
import { formatDate } from '@plone/volto/helpers/Utils/Date';

import { connect } from 'react-redux';

import { Card as UiCard } from 'semantic-ui-react';

import {
  CardDescription,
  CardExtra,
  CardImage,
  CardMeta,
  CardTitle,
} from '@eeacms/volto-listing-block/components/UniversalCard';

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

const CardEEABenchmarkLevel = ({ item, benchmark_level_items }) => {
  const benchmark_level = item?.['benchmark_level']?.[0];
  const benchmark_level_item = benchmark_level_items?.find(
    (item) => item.value === benchmark_level,
  );
  return (
    <div className="benchmark_level_wrapper">
      <div className={`metadata benchmark_level ${benchmark_level ?? -1}`}>
        &nbsp;
      </div>
      {benchmark_level_item?.label}
    </div>
  );
};

CardEEABenchmarkLevel.propTypes = {
  item: PropTypes.shape({
    benchmark_level: PropTypes.arrayOf(PropTypes.string),
  }),
  benchmark_level_items: PropTypes.arrayOf(PropTypes.object),
};

const VisualizationCard = (props) => {
  const { className, item, itemModel = {}, benchmark_level_items } = props;
  const contentType = item.type_title || item['@type'];
  const showDate =
    itemModel.hasDate !== false &&
    item.EffectiveDate &&
    item.EffectiveDate !== 'None';
  const imagePosition = props.imagePosition;
  const preview_image_url =
    props.preview_image_url ??
    (item['@type'] === 'ims_indicator'
      ? undefined
      : item['@id'] + '/@@plotly_preview.svg/soer_miniature');
  return (
    <UiCard fluid={true} className={cx('u-card', getStyles(props), className)}>
      <UiCard.Content>
        {itemModel.hasContentType && contentType && (
          <UiCard.Meta className="content-type">{contentType}</UiCard.Meta>
        )}
        <CardTitle {...props} />
        {showDate && (
          <UiCard.Meta className="publishing-date">
            <time dateTime={item.EffectiveDate}>
              {formatDate({
                date: item.EffectiveDate,
                format: {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                },
                locale: config.settings.dateLocale || 'en-gb',
              })}
            </time>
          </UiCard.Meta>
        )}
        <CardEEABenchmarkLevel
          item={item}
          benchmark_level_items={benchmark_level_items}
        />
        <CardDescription {...props} />
        <CardImage {...props} preview_image_url={preview_image_url} />
        <CardMeta {...props} itemModel={{ ...itemModel, hasDate: false }} />
      </UiCard.Content>
      {imagePosition && imagePosition === 'right' && <CardImage {...props} />}

      <CardExtra {...props} />
    </UiCard>
  );
};

VisualizationCard.propTypes = {
  item: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.string,
    type_title: PropTypes.string,
    EffectiveDate: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    preview_image_url: PropTypes.string,
    meta: PropTypes.string,
    extra: PropTypes.any,
    imagePosition: PropTypes.string,
    benchmark_level: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  className: PropTypes.string,
  itemModel: PropTypes.object,
  imagePosition: PropTypes.string,
  preview_image_url: PropTypes.string,
  benchmark_level_items: PropTypes.arrayOf(PropTypes.object),
};

export default connect((state) => ({
  benchmark_level_items:
    state.vocabularies?.['collective.taxonomy.benchmark_level']?.items,
}))(VisualizationCard);
