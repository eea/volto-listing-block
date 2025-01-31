import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { useIntl } from 'react-intl';
import messages from '@eeacms/volto-listing-block/messages';
import { Message } from 'semantic-ui-react';
import { isInternalURL } from '@plone/volto/helpers';
import { getFieldURL } from '@plone/volto/helpers/Url/Url';
import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import '@eeacms/volto-listing-block/less/teaser-cards.less';

const TeaserCardTemplate = (props) => {
  const { data, isEditMode, onChangeBlock, onSelectBlock, block, ...rest } =
    props;
  const intl = useIntl();

  const item = data.href?.[0];

  const image = getFieldURL(data.preview_image);

  const isExternal = !isInternalURL(image);
  return item || data.preview_image ? (
    <UniversalCard
      isEditMode={isEditMode}
      {...rest}
      {...{
        ...data,
        preview_image_url: isExternal
          ? getFieldURL(data.preview_image)
          : `${image}/@@images/image`,
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
