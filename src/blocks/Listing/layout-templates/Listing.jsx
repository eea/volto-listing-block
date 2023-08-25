import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import moment from 'moment'; // TODO: this needs to be lazyloaded!!!
import { ConditionalLink } from '@plone/volto/components';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { flattenToAppURL } from '@plone/volto/helpers';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

const Listing = (props) => {
  const { block, items, linkTitle, linkHref, isEditMode } = props;
  let href = linkHref?.[0]?.['@id'] || '';

  moment.locale(config.settings.dateLocale);
  const link = isInternalURL(href) ? (
    <ConditionalLink to={flattenToAppURL(href)} condition={!isEditMode}>
      {linkTitle || href}
    </ConditionalLink>
  ) : href ? (
    <a href={href}>{linkTitle || href}</a>
  ) : null;

  return (
    <>
      <div className={'items ' + props.itemModel['@type'] + '-items'}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <UniversalCard
              {...props}
              key={`item-${block}-${index}`}
              item={item}
            />
          ))
        ) : (
          <p>
            <FormattedMessage
              id="There are no items to show in this view."
              defaultMessage="There are no items to show in this view."
            />
          </p>
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
