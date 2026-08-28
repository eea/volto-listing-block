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

export const getIndicatorContentSubrequestId = (block, indicatorPaths) =>
  `visualization-card-indicator-content-${block || 'listing'}-${hashPaths(
    indicatorPaths,
  ).toString(36)}`;

const getIndicatorPath = (item) =>
  flattenToAppURL(item?.['@id'] || '').replace(/\/$/, '');

export const getDataFigurePreviewUrl = (value, visited = new Set()) => {
  if (!value || typeof value !== 'object' || visited.has(value)) return;
  visited.add(value);

  if (value['@type'] === 'dataFigure') {
    const previewUrl = value.url || value.svgs?.find((item) => item?.url)?.url;
    if (previewUrl) return flattenToAppURL(previewUrl);
  }

  const orderedBlocks = value.blocks
    ? [
        ...(value.blocks_layout?.items || [])
          .map((id) => value.blocks[id])
          .filter(Boolean),
        ...Object.entries(value.blocks)
          .filter(([id]) => !(value.blocks_layout?.items || []).includes(id))
          .map(([, block]) => block),
      ]
    : [];

  for (const block of orderedBlocks) {
    const previewUrl = getDataFigurePreviewUrl(block, visited);
    if (previewUrl) return previewUrl;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'blocks' || key === 'blocks_layout') continue;
    const previewUrl = getDataFigurePreviewUrl(child, visited);
    if (previewUrl) return previewUrl;
  }
};

const getLeadImagePreviewUrl = (indicator) => {
  if (!indicator?.image && !indicator?.image_field) return;
  return getImageScaleParams(indicator, 'preview')?.download;
};

const getVisualizationPreviewUrl = (visualization) => {
  if (!visualization?.image_field || !visualization?.image_scales) return;
  return getImageScaleParams(visualization, 'preview')?.download;
};

export const getIndicatorPreviewUrl = (
  indicator,
  visualizations = [],
  indicatorContents = [],
) => {
  const indicatorPath = getIndicatorPath(indicator);
  const indicatorContent =
    indicatorContents.find(
      (item) => getIndicatorPath(item) === indicatorPath,
    ) || indicator;

  const leadImagePreviewUrl =
    getLeadImagePreviewUrl(indicatorContent) ||
    getLeadImagePreviewUrl(indicator);
  if (leadImagePreviewUrl) return leadImagePreviewUrl;

  const dataFigurePreviewUrl = getDataFigurePreviewUrl(indicatorContent);
  if (dataFigurePreviewUrl) return dataFigurePreviewUrl;

  const visualization = visualizations.find((item) => {
    const visualizationPath = flattenToAppURL(item?.['@id'] || '');
    return (
      visualizationPath.startsWith(`${indicatorPath}/`) &&
      getVisualizationPreviewUrl(item)
    );
  });

  return getVisualizationPreviewUrl(visualization);
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
  const indicatorContentSubrequestId = useMemo(
    () => getIndicatorContentSubrequestId(block, indicatorPaths),
    [block, indicatorPaths],
  );
  const indicatorPreviewRequest = useSelector(
    (state) => state.search?.subrequests?.[indicatorPreviewSubrequestId],
  );
  const indicatorContentRequest = useSelector(
    (state) => state.search?.subrequests?.[indicatorContentSubrequestId],
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

  useEffect(() => {
    if (
      indicatorPaths.length > 0 &&
      !indicatorContentRequest?.loading &&
      !indicatorContentRequest?.loaded &&
      !indicatorContentRequest?.error
    ) {
      dispatch(
        searchContent(
          '',
          {
            portal_type: INDICATOR_TYPE,
            path: indicatorPaths,
            'path.depth': 0,
            b_size: Math.min(Math.max(indicatorPaths.length, 25), 1000),
            fullobjects: 1,
          },
          indicatorContentSubrequestId,
        ),
      );
    }
  }, [
    dispatch,
    indicatorContentRequest?.error,
    indicatorContentRequest?.loaded,
    indicatorContentRequest?.loading,
    indicatorContentSubrequestId,
    indicatorPaths,
  ]);

  const indicatorVisualizations = indicatorPreviewRequest?.items || [];
  const indicatorContents = indicatorContentRequest?.items || [];

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
                  ? getIndicatorPreviewUrl(
                      item,
                      indicatorVisualizations,
                      indicatorContents,
                    )
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
