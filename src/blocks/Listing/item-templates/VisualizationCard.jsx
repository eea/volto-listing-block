import cx from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

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

const capitalize_eea_target = (str) => {
  if (!str) return '';
  const txt = str.replace('-', ' ');
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

const CardEEATarget = ({ item }) => {
  const eea_target = item?.['taxonomy_eea_target']?.[0];
  if (!eea_target) {
    return null;
  }
  return (
    <div className="taxonomy_eea_target_wrapper">
      <div className={`metadata taxonomy_eea_target ${eea_target}`}>&nbsp;</div>
      {capitalize_eea_target(eea_target)}
    </div>
  );
};

CardEEATarget.propTypes = {
  item: PropTypes.shape({
    taxonomy_eea_target: PropTypes.arrayOf(PropTypes.string),
  }),
};

const VisualizationCard = (props) => {
  const { className, item } = props;
  const imagePosition = props.imagePosition;
  const preview_image_url =
    item['@id'] + '/@@plotly_preview.svg/soer_miniature';
  return (
    <UiCard fluid={true} className={cx('u-card', getStyles(props), className)}>
      <UiCard.Content>
        <CardTitle {...props} />
        <CardEEATarget item={item} />
        <CardDescription {...props} />
        <CardImage {...props} preview_image_url={preview_image_url} />
        <CardMeta {...props} />
      </UiCard.Content>
      {imagePosition && imagePosition === 'right' && <CardImage {...props} />}

      <CardExtra {...props} />
    </UiCard>
  );
};

VisualizationCard.propTypes = {
  item: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    preview_image_url: PropTypes.string,
    meta: PropTypes.string,
    extra: PropTypes.any,
    imagePosition: PropTypes.string,
    taxonomy_eea_target: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  className: PropTypes.string,
  imagePosition: PropTypes.string,
};

export default VisualizationCard;
