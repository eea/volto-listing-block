import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { defineMessages, useIntl } from 'react-intl';
import { Message } from 'semantic-ui-react';
import { isInternalURL } from '@plone/volto/helpers';
import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import '@eeacms/volto-listing-block/less/teaser-cards.less';

const messages = defineMessages({
  PleaseChooseContent: {
    id: 'Please choose an existing content as source for this element',
    defaultMessage:
      'Please choose an existing content as source for this element',
  },
});

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

  const modelatePreviewImage = (data) => {
    if (!data.preview_image) return {};
    return {
      preview_image_url:
        typeof data.preview_image === 'string' &&
        !isInternalURL(data.preview_image)
          ? data.preview_image
          : '',
      preview_image: Array.isArray(data.preview_image)
        ? data.preview_image
        : [
            typeof data.preview_image === 'string'
              ? {
                  '@id': data.preview_image,
                  url: data.preview_image,
                  title: data.preview_image,
                }
              : data.preview_image,
          ],
    };
  };
  return item || data.preview_image ? (
    <UniversalCard
      isEditMode={isEditMode}
      {...rest}
      {...{
        ...data,
        ...modelatePreviewImage(data),
      }}
      item={{ ...(item || {}), ...omit(data, ['@type']) }}
      itemModel={data.itemModel || {}}
    />
  ) : isEditMode ? (
    <Message>
      <div className="teaser-item placeholder">
        <img src={imageBlockSVG} alt="" />
        <p>{intl.formatMessage(messages.PleaseChooseContent)}</p>
      </div>
    </Message>
  ) : null;
};

TeaserCardTemplate.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default TeaserCardTemplate;
