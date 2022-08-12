import { ConditionalLink } from '@plone/volto/components';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Card } from 'semantic-ui-react';
import React from 'react';
import PreviewImage from './PreviewImage';
import config from '@plone/volto/registry';
import cx from 'classnames';
import './less/editor.less';

const CustomCardsGalleryTemplate = ({
  items,
  gridSize,
  isEditMode,
  hasDate,
  hasDescription,
  styles,
}) => {
  moment.locale(config.settings.dateLocale);
  const makeTextBody = (item) => (
    <Card.Content>
      <Card.Header>{item.title ? item.title : item.id}</Card.Header>
      <Card.Meta>
        {hasDate && item.effective && (
          <span className="category">
            {moment(item.effective).format('ll')}
          </span>
        )}
      </Card.Meta>
      {hasDescription && (
        <Card.Description>
          <p>{item.description}</p>
        </Card.Description>
      )}
    </Card.Content>
  );

  const makeImage = (item) => {
    return (
      <ConditionalLink className="image" item={item} condition={!isEditMode}>
        <PreviewImage item={item} alt={item.title} />
      </ConditionalLink>
    );
  };

  return (
    <>
      {items && items.length > 0 && (
        <div className={`ui fluid ${gridSize || ''} cards`}>
          {items.map((item) => (
            <Card key={item['@id']} className={cx('centered', styles?.theme)}>
              {makeImage(item)}
              {makeTextBody(item)}
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

CustomCardsGalleryTemplate.schemaEnhancer = ({ schema, formData, intl }) => {
  schema.fieldsets[0].fields = [
    ...schema.fieldsets[0].fields,
    'gridSize',
    'hasDate',
    'hasDescription',
  ];

  schema.properties = {
    ...schema.properties,
    gridSize: {
      title: 'Grid Size',
      choices: [
        ['three', 'Three'],
        ['four', 'Four'],
      ],
      factory: 'Choice',
      type: 'string',
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

CustomCardsGalleryTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default CustomCardsGalleryTemplate;
