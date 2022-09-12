import { ConditionalLink } from '@plone/volto/components';
import { UniversalItem } from '@eeacms/volto-listing-block';
import { flattenToAppURL } from '@plone/volto/helpers';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

const SummaryListing = (props) => {
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
      <div className="items">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <UniversalItem
              {...props}
              key={`item-${block}-${index}`}
              item={item}
            />
          ))
        ) : (
          <p>There are no items to show in this view.</p>
        )}
      </div>

      {link && <div className="footer">{link}</div>}
    </>
  );
};

SummaryListing.schemaEnhancer = (args) => {
  const schema = UniversalItem.schemaEnhancer(args);
  return schema;
};

SummaryListing.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default SummaryListing;
