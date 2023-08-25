import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { Message } from 'semantic-ui-react';
import { useIntl } from 'react-intl';

import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import messages from '@eeacms/volto-listing-block/messages';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';

const TeaserCardTemplate = (props) => {
  const { data, isEditMode, ...rest } = props;
  const intl = useIntl();
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
    <Message>
      <div className="grid-teaser-item placeholder">
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
