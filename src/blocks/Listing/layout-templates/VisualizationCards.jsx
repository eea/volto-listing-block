import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import config from '@plone/volto/registry';
import '@eeacms/volto-listing-block/less/visualization-cards.less';
import { getVocabulary } from '@plone/volto/actions/vocabularies/vocabularies';
import { searchContent } from '@plone/volto/actions/search/search';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { getImageScaleParams } from '@eeacms/volto-object-widget/helpers';
import { useDispatch, useSelector } from 'react-redux';

const INDICATOR_TYPE = 'ims_indicator';

const hashPaths = (paths) => {
  return paths
    .join('|')
    .split('')
    .reduce((hash, character) => {
      return (hash * 31 + character.charCodeAt(0)) >>> 0;
    }, 0);
};

export const getIndicatorPreviewSubrequestId = (block, indicatorPaths) =>
  `visualization-card-indicator-previews-${block || 'listing'}-${hashPaths(
    indicatorPaths,
  ).toString(36)}`;

export const getIndicatorPreviewUrl = (indicator, visualizations = []) => {
  const indicatorPath = flattenToAppURL(indicator?.['@id'] || '').replace(
    /\/$/,
    '',
  );
  const visualization = visualizations.find((item) => {
    const visualizationPath = flattenToAppURL(item?.['@id'] || '');
    return visualizationPath.startsWith(`${indicatorPath}/`);
  });

  return getImageScaleParams(visualization, 'preview')?.download;
};

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

  const indicatorPaths = useMemo(
    () =>
      (items || [])
        .filter((item) => item?.['@type'] === INDICATOR_TYPE)
        .map((item) => flattenToAppURL(item['@id'])),
    [items],
  );
  const indicatorPreviewSubrequestId = useMemo(
    () => getIndicatorPreviewSubrequestId(block, indicatorPaths),
    [block, indicatorPaths],
  );
  const indicatorPreviewRequest = useSelector(
    (state) => state.search?.subrequests?.[indicatorPreviewSubrequestId],
  );

  useEffect(() => {
    dispatch(
      getVocabulary({ vocabNameOrURL: 'collective.taxonomy.benchmark_level' }),
    );
  }, [dispatch]);

  useEffect(() => {
    if (
      indicatorPaths.length > 0 &&
      !indicatorPreviewRequest?.loading &&
      !indicatorPreviewRequest?.loaded &&
      !indicatorPreviewRequest?.error
    ) {
      dispatch(
        searchContent(
          '',
          {
            portal_type: 'visualization',
            path: indicatorPaths,
            'path.depth': 1,
            b_size: Math.min(Math.max(indicatorPaths.length * 10, 25), 1000),
            sort_on: 'getObjPositionInParent',
            metadata_fields: ['image_field', 'image_scales'],
          },
          indicatorPreviewSubrequestId,
        ),
      );
    }
  }, [
    dispatch,
    indicatorPaths,
    indicatorPreviewRequest?.error,
    indicatorPreviewRequest?.loaded,
    indicatorPreviewRequest?.loading,
    indicatorPreviewSubrequestId,
  ]);

  const indicatorVisualizations = indicatorPreviewRequest?.items || [];

  return (
    <>
      {items && items.length > 0 && (
        <div className={`ui fluid ${gridSize || ''} cards`}>
          {items.map((item, i) => (
            <UniversalCard
              key={i}
              {...rest}
              block={block}
              item={item}
              preview_image_url={
                item?.['@type'] === INDICATOR_TYPE
                  ? getIndicatorPreviewUrl(item, indicatorVisualizations)
                  : undefined
              }
            />
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
        ['four', 'Four'],
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
