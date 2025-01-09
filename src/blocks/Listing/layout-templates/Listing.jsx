import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'; // TODO: this needs to be lazyloaded!!!
import { ConditionalLink } from '@plone/volto/components';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  noItemsToShow: {
    id: 'noItemsToShow',
    defaultMessage: 'There are no items to show in this view.',
  },
});

const Listing = (props) => {
  const { block, items, linkTitle, linkHref, isEditMode, intl } = props;
  let href = linkHref?.[0]?.['@id'] || '';

  moment.locale(config.settings.dateLocale);
  const link = isInternalURL(href) ? (
    <ConditionalLink to={href} condition={!isEditMode}>
      {linkTitle || href}
    </ConditionalLink>
  ) : href ? (
    <a href={href}>{linkTitle || href}</a>
  ) : null;

  return (
    <>
      <div className={'items ' + props?.itemModel?.['@type'] + '-items'}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <UniversalCard
              {...props}
              key={`item-${block}-${index}`}
              item={item}
            />
          ))
        ) : (
          <p>{intl.formatMessage(messages.noItemsToShow)}</p>
        )}
      </div>

      {link && <div className="footer">{link}</div>}
    </>
  );
};

Listing.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

Listing.schemaEnhancer = UniversalCard.schemaEnhancer;

export default Listing;
