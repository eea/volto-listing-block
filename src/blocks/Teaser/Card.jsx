import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import ImageWidget from './ImageWidget';
import '@eeacms/volto-listing-block/less/teaser-cards.less';

const TeaserCardTemplate = (props) => {
  const {
    data,
    isEditMode,
    onChangeBlock,
    onSelectBlock,
    block,
    ...rest
  } = props;
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
      block={block}
      onSelectBlock={onSelectBlock}
      onChange={(e, id) => {
        onChangeBlock(block, {
          ...data,
          preview_image_url: typeof id === 'string' ? id : '',
          href: [typeof id === 'string' ? { id: id, url: id, title: id } : id],
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
