import React from 'react';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';
import { Link } from 'react-router-dom';
import config from '@plone/volto/registry';
import moment from 'moment';
import PropTypes from 'prop-types';
import messages from '@eeacms/volto-listing-block/messages';

const CustomNewsListTemplate = ({
  items,
  gridSize,
  isEditMode,
  hasDate,
  hasDescription,
}) => {
  moment.locale(config.settings.dateLocale);
  const makeTextBody = (item) => (
    <div className="news-item">
      <Link
        className="news-headline"
        title={item.title}
        to={item['@id'] ? flattenToAppURL(getBaseUrl(item['@id'])) : ''}
      >
        {item.title ? item.title : item.id}
      </Link>

      {hasDate && item.effective && (
        <div>
          <span className="info-prefix">Published:{'  '}</span>
          <span className="news-date">
            {moment(item.effective).format('ll')}
          </span>
        </div>
      )}
      {hasDescription && (
        <div className="description">
          <p>{item.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {items && items.length > 0 && (
        <div className={`ui fluid`}>
          {items.map((item) => (
            <div key={item['@id']}>{makeTextBody(item)}</div>
          ))}
        </div>
      )}
    </>
  );
};

CustomNewsListTemplate.schemaEnhancer = ({ schema, formData, intl }) => {
  schema.fieldsets.splice(1, 0, {
    id: 'newsList',
    title: intl.formatMessage(messages.newsItem),
    fields: ['hasDate', 'hasDescription'],
  });

  schema.properties = {
    ...schema.properties,
    hasDate: {
      title: intl.formatMessage(messages.publicationDate),
      type: 'boolean',
    },
    hasDescription: {
      title: intl.formatMessage(messages.description),
      type: 'boolean',
    },
  };
  return schema;
};

CustomNewsListTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default CustomNewsListTemplate;
