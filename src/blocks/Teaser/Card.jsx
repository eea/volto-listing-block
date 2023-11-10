import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import ImageWidget from './ImageWidget';
import '@eeacms/volto-listing-block/less/teaser-cards.less';

const TeaserCardTemplate = (props) => {
  const { data, isEditMode, onChangeBlock, block, ...rest } = props;
  const item = data.href?.[0];

  return item ? (
    <UniversalCard
      isEditMode={isEditMode}
      {...rest}
      {...data}
      item={{ ...(item || {}), ...omit(data, ['@type']) }}
      itemModel={data.itemModel || {}}
    />
  ) : isEditMode ? (
    <ImageWidget
      onChange={(e, id, ll) => {
        onChangeBlock(block, {
          ...data,
          href: [id],
        });
      }}
    />
  ) : null;
};

TeaserCardTemplate.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default TeaserCardTemplate;
