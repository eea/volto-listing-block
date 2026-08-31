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
const EMBED_CONTENT_TYPE = 'embed_content';

const hashPaths = (paths) => {
  return paths
    .join('|')
    .split('')
    .reduce((hash, character) => {
      return (hash * 31 + character.charCodeAt(0)) >>> 0;
    }, 0);
};

export const getIndicatorContentSubrequestId = (block, indicatorPaths) =>
  `visualization-card-indicator-content-${block || 'listing'}-${hashPaths(
    indicatorPaths,
  ).toString(36)}`;

export const getEmbeddedContentSubrequestId = (block, embeddedContentUIDs) =>
  `visualization-card-embedded-content-${block || 'listing'}-${hashPaths(
    embeddedContentUIDs,
  ).toString(36)}`;

const getIndicatorPath = (item) =>
  flattenToAppURL(item?.['@id'] || '').replace(/\/$/, '');

const getResolveUID = (url) =>
  url?.match(/(?:^|\/)resolveuid\/([^/?#]+)/i)?.[1];

export const getEmbedContentReferences = (value, visited = new Set()) => {
  if (!value || typeof value !== 'object' || visited.has(value)) return [];
  visited.add(value);

  if (value['@type'] === EMBED_CONTENT_TYPE) {
    const url = value.url || value.href;
    const uid = getResolveUID(url);
    return uid ? [{ uid, url }] : [];
  }

  const blockIds = value.blocks_layout?.items || [];
  const orderedBlocks = value.blocks
    ? [
        ...blockIds.map((id) => value.blocks[id]).filter(Boolean),
        ...Object.entries(value.blocks)
          .filter(([id]) => !blockIds.includes(id))
          .map(([, block]) => block),
      ]
    : [];
  const references = orderedBlocks.flatMap((child) =>
    getEmbedContentReferences(child, visited),
  );

  for (const [key, child] of Object.entries(value)) {
    if (key === 'blocks' || key === 'blocks_layout') continue;
    references.push(...getEmbedContentReferences(child, visited));
  }

  return references;
};

const getLeadImagePreviewUrl = (indicator) => {
  if (!indicator?.image && !indicator?.image_field) return;
  return getImageScaleParams(indicator, 'preview')?.download;
};

const getEmbeddedContentPreviewUrl = (content) => {
  if (!content?.image_field || !content?.image_scales) return;
  return getImageScaleParams(content, 'preview')?.download;
};

export const getIndicatorPreviewUrl = (
  indicator,
  indicatorContents = [],
  embeddedContents = [],
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

  const embeddedContentByUID = new Map(
    embeddedContents.map((content) => [content.UID, content]),
  );
  const embeddedContentReferences = getEmbedContentReferences(indicatorContent);

  for (const { uid } of embeddedContentReferences) {
    const previewUrl = getEmbeddedContentPreviewUrl(
      embeddedContentByUID.get(uid),
    );
    if (previewUrl) return previewUrl;
  }
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
  const indicatorContentSubrequestId = useMemo(
    () => getIndicatorContentSubrequestId(block, indicatorPaths),
    [block, indicatorPaths],
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

  const indicatorContents = useMemo(
    () => indicatorContentRequest?.items || [],
    [indicatorContentRequest?.items],
  );
  const embeddedContentUIDs = useMemo(
    () => [
      ...new Set(
        indicatorContents.flatMap((indicator) =>
          getEmbedContentReferences(indicator).map(({ uid }) => uid),
        ),
      ),
    ],
    [indicatorContents],
  );
  const embeddedContentSubrequestId = useMemo(
    () => getEmbeddedContentSubrequestId(block, embeddedContentUIDs),
    [block, embeddedContentUIDs],
  );
  const embeddedContentRequest = useSelector(
    (state) => state.search?.subrequests?.[embeddedContentSubrequestId],
  );

  useEffect(() => {
    if (
      embeddedContentUIDs.length > 0 &&
      !embeddedContentRequest?.loading &&
      !embeddedContentRequest?.loaded &&
      !embeddedContentRequest?.error
    ) {
      dispatch(
        searchContent(
          '',
          {
            UID: embeddedContentUIDs,
            b_size: Math.min(Math.max(embeddedContentUIDs.length, 25), 1000),
            metadata_fields: ['UID', 'image_field', 'image_scales'],
          },
          embeddedContentSubrequestId,
        ),
      );
    }
  }, [
    dispatch,
    embeddedContentRequest?.error,
    embeddedContentRequest?.loaded,
    embeddedContentRequest?.loading,
    embeddedContentSubrequestId,
    embeddedContentUIDs,
  ]);

  const embeddedContents = embeddedContentRequest?.items || [];

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
                      indicatorContents,
                      embeddedContents,
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
