import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import config from '@plone/volto/registry';
import '@eeacms/volto-listing-block/less/visualization-cards.less';
import { getVocabulary } from '@plone/volto/actions';
import { useDispatch } from 'react-redux';

const VisualizationCards = ({
  block,
  items,
  gridSize,
  isEditMode,
  hasDate,
  hasDescription,
  ...rest
}) => {
  const dispatch = useDispatch();
  moment.locale(config.settings.dateLocale);

  useEffect(() => {
    dispatch(getVocabulary({ vocabNameOrURL: 'collective.taxonomy.benchmark_level' }));
  }, [dispatch]);

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

VisualizationCards.schemaEnhancer = ({ schema }) => {
  schema.fieldsets.splice(1, 0, {
    id: 'cardsVisualization',
    title: 'Visualization Cards',
    fields: ['gridSize'],
  });

  schema.properties = {
    ...schema.properties,
    gridSize: {
      title: 'Grid Size',
      choices: [
        ['five', 'Five'],
        ['six', 'Six'],
      ],
      default: 'five',
      factory: 'Choice',
      type: 'string',
    },
  };
  return schema;
};

VisualizationCards.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default VisualizationCards;
