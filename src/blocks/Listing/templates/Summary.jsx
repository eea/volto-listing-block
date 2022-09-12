import { ConditionalLink } from '@plone/volto/components';
import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';
import { flattenToAppURL } from '@plone/volto/helpers';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

const BodyText = ({ item, hasDate, hasDescription }) => {
  return (
    <div className="listing-body">
      <h3 className={'listing-header'}>{item.title ? item.title : item.id}</h3>
      {hasDate && item.effective && (
        <p className={'listing-date'}>{moment(item.effective).format('ll')}</p>
      )}
      {hasDescription && (
        <p className={'listing-description'}>{item.description}</p>
      )}
    </div>
  );
};

const CustomSummaryListingBlockTemplate = ({
  items,
  linkTitle,
  linkHref,
  isEditMode,
  imageOnRightSide,
  hasImage,
  hasDate,
  hasDescription,
}) => {
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
          items.map((item) => (
            <div className="listing-item" key={item['@id']}>
              <ConditionalLink item={item} condition={!isEditMode}>
                {hasImage ? (
                  imageOnRightSide ? (
                    <>
                      <BodyText
                        item={item}
                        hasDescription={hasDescription}
                        hasDate={hasDate}
                      />
                      <PreviewImage
                        item={item}
                        style={{ marginLeft: 'auto' }}
                      />
                    </>
                  ) : (
                    <>
                      <PreviewImage item={item} />
                      <BodyText
                        item={item}
                        hasDescription={hasDescription}
                        hasDate={hasDate}
                      />
                    </>
                  )
                ) : (
                  <BodyText
                    item={item}
                    hasDescription={hasDescription}
                    hasDate={hasDate}
                  />
                )}
              </ConditionalLink>
            </div>
          ))
        ) : (
          <p>There are no items to show in this view.</p>
        )}
      </div>

      {link && <div className="footer">{link}</div>}
    </>
  );
};

CustomSummaryListingBlockTemplate.schemaEnhancer = ({
  schema,
  formData,
  intl,
}) => {
  schema.fieldsets[0].fields = [
    ...schema.fieldsets[0].fields,
    'imageOnRightSide',
    'hasImage',
    'hasDate',
    'hasDescription',
  ];

  schema.properties = {
    ...schema.properties,
    hasImage: {
      title: 'Image',
      type: 'boolean',
    },
    imageOnRightSide: {
      title: 'Image on Right (Default is Left)',
      type: 'boolean',
    },
    hasDate: {
      title: 'Publication date',
      type: 'boolean',
    },
    hasDescription: {
      title: 'Description',
      type: 'boolean',
    },
  };
  return schema;
};

CustomSummaryListingBlockTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default CustomSummaryListingBlockTemplate;

// import DefaultImageSVG from '@plone/volto/components/manage/Blocks/Listing/default-image.svg';
// const makeImage = (item, style) => (
//   <img
//     style={style}
//     src={
//       item[settings.listingPreviewImageField]
//         ? flattenToAppURL(
//             item[settings.listingPreviewImageField].scales.preview.download,
//           )
//         : settings.depiction
//         ? flattenToAppURL(item['@id'] + settings.depiction)
//         : DefaultImageSVG
//     }
//     alt={item.title}
//   />
// );
