import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { defineMessages, useIntl } from 'react-intl';
import { Message } from 'semantic-ui-react';
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
  const { data, isEditMode, onChangeBlock, onSelectBlock, block, ...rest } =
    props;
  const intl = useIntl();

  const item = data.href?.[0];


  return item || data.preview_image ? (
    <UniversalCard
      isEditMode={isEditMode}
      {...rest}
      {...{
        ...data,
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
