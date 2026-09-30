import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'; // TODO: this needs to be lazyloaded!!!
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import messages from '@eeacms/volto-listing-block/messages';
import useIndicatorPreviews from '@eeacms/volto-listing-block/components/UniversalCard/useIndicatorPreviews';
import {
  getCardVariant,
  migrateItemModel,
} from '@eeacms/volto-listing-block/components/UniversalCard/migrate';

const Listing = (props) => {
  const { block, items, linkTitle, linkHref, isEditMode, intl } = props;
  let href = linkHref?.[0]?.['@id'] || '';
  const getIndicatorPreview = useIndicatorPreviews(items, block);
  // keeps the per-flavour grid classes, e.g. .imageOnLeft-items
  const cardVariant = getCardVariant(migrateItemModel(props.itemModel || {}));

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
      <div className={`items ${cardVariant}-items`}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <UniversalCard
              {...props}
              key={`item-${block}-${index}`}
              item={item}
              preview_image_url={getIndicatorPreview(item)}
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
