import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import config from '@plone/volto/registry';

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

Gallery.schemaEnhancer = ({ schema }) => {
  schema.fieldsets.splice(1, 0, {
    id: 'cardsGallery',
    title: 'Gallery',
    fields: ['gridSize'],
  });

  schema.properties = {
    ...schema.properties,
    gridSize: {
      title: 'Grid Size',
      choices: [
        ['three', 'Three'],
        ['four', 'Four'],
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
