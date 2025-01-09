import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  galleryTitle: {
    id: 'galleryTitle',
    defaultMessage: 'Gallery',
  },
  gridSize: {
    id: 'gridSize',
    defaultMessage: 'Grid Size',
  },
  three: {
    id: 'three',
    defaultMessage: 'Three',
  },
  four: {
    id: 'four',
    defaultMessage: 'Four',
  },
});

const Gallery = ({
  block,
  items,
  gridSize,
  isEditMode,
  hasDate,
  hasDescription,
  ...rest
}) => {
  moment.locale(config.settings.dateLocale);
  return (
    <>
      {items && items.length > 0 && (
        <div className={`ui fluid ${gridSize || ''} cards`}>
          {items.map((item, i) => (
            <UniversalCard key={i} {...rest} block={block} item={item} />
          ))}
        </div>
      )}
    </>
  );
};

Gallery.schemaEnhancer = ({ schema, intl }) => {
  schema.fieldsets.splice(1, 0, {
    id: 'cardsGallery',
    title: intl.formatMessage(messages.galleryTitle),
    fields: ['gridSize'],
  });

  schema.properties = {
    ...schema.properties,
    gridSize: {
      title: intl.formatMessage(messages.gridSize),
      choices: [
        ['three', intl.formatMessage(messages.three)],
        ['four', intl.formatMessage(messages.four)],
      ],
      default: 'three',
      factory: 'Choice',
      type: 'string',
    },
  };
  return schema;
};

Gallery.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default Gallery;
