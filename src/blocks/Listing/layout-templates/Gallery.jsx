import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import config from '@plone/volto/registry';
import messages from '@eeacms/volto-listing-block/messages';
import useIndicatorPreviews from '@eeacms/volto-listing-block/components/UniversalCard/useIndicatorPreviews';
import { getLayoutItemModel } from '@eeacms/volto-listing-block/components/UniversalCard/migrate';
import { getBorder } from '@eeacms/volto-listing-block/components/UniversalCard/border';

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
  const getIndicatorPreview = useIndicatorPreviews(items, block);
  // bordered cards touch and share their borders, as the cells of a table
  const isTable = getBorder(rest.itemModel?.styles) === 'bordered';
  return (
    <>
      {items && items.length > 0 && (
        <div
          className={cx('ui fluid cards', gridSize, {
            'cards-table': isTable,
          })}
        >
          {items.map((item, i) => (
            <UniversalCard
              key={i}
              {...rest}
              itemModel={getLayoutItemModel(rest.itemModel, 'cardsGallery')}
              block={block}
              item={item}
              isEditMode={isEditMode}
              {...getIndicatorPreview(item)}
            />
          ))}
        </div>
      )}
    </>
  );
};

Gallery.schemaEnhancer = ({ schema, intl }) => {
  schema.fieldsets.splice(1, 0, {
    id: 'cardsGallery',
    title: intl.formatMessage(messages.gridTitle),
    fields: ['gridSize'],
  });

  schema.properties = {
    ...schema.properties,
    gridSize: {
      title: intl.formatMessage(messages.gridSize),
      choices: [
        ['three', intl.formatMessage(messages.three)],
        ['four', intl.formatMessage(messages.four)],
        ['five', intl.formatMessage(messages.five)],
        ['six', intl.formatMessage(messages.six)],
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
