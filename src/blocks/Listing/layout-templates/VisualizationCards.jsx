import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import config from '@plone/volto/registry';
import '@eeacms/volto-listing-block/less/visualization-cards.less';
import { getVocabulary } from '@plone/volto/actions/vocabularies/vocabularies';
import { searchContent } from '@plone/volto/actions/search/search';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';
import { getImageScaleParams } from '@eeacms/volto-object-widget/helpers';
import { useDispatch, useSelector } from 'react-redux';

const INDICATOR_TYPE = 'ims_indicator';
const EMBED_CONTENT_TYPE = 'embed_content';
const EMBED_VISUALIZATION_TYPES = ['embed_visualization', 'embed_chart'];
const DATA_FIGURE_TYPE = 'dataFigure';
const PLOTLY_PREVIEW_PATH = '/@@plotly_preview.svg/soer_miniature';

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

export const getEmbeddedContentPathSubrequestId = (
  block,
  embeddedContentPaths,
) =>
  `visualization-card-embedded-content-paths-${
    block || 'listing'
  }-${hashPaths(embeddedContentPaths).toString(36)}`;

const getIndicatorPath = (item) =>
  flattenToAppURL(item?.['@id'] || '').replace(/\/$/, '');

const getResolveUID = (url) =>
  url?.match(/(?:^|\/)resolveuid\/([^/?#]+)/i)?.[1];

const isPreviewImageURL = (url) =>
  /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(url || '');

const getInternalReferencePath = (url, assumeInternal = false) => {
  if (!url) return;

  if (isInternalURL(url)) {
    const flattenedUrl = flattenToAppURL(url);

    if (!/^https?:\/\//i.test(flattenedUrl)) {
      return flattenedUrl.replace(/[?#].*$/, '').replace(/\/$/, '');
    }
  }

  // The Plotly block's `vis_url` comes from an internal content widget, but
  // older content can store the public absolute URL. Its host may differ from
  // Volto's configured publicURL (for example behind the demo proxy), so use
  // the URL pathname as the catalog path.
  if (assumeInternal) {
    try {
      return new URL(url).pathname.replace(/\/$/, '');
    } catch {
      return;
    }
  }
};

const getDirectBlockPreviewUrl = (block) => {
  const imageField =
    block?.image_field ||
    (block?.image_scales?.preview_image
      ? 'preview_image'
      : Object.keys(block?.image_scales || {})[0]);
  const url = block?.url || block?.href || block?.vis_url;

  if (!imageField || !url) return;

  return getImageScaleParams(
    { ...block, '@id': url, image_field: imageField },
    'preview',
  )?.download;
};

const getVisualizationReference = (block) => {
  const blockType = block?.['@type'];
  const isEmbedContent = blockType === EMBED_CONTENT_TYPE;
  const isEmbedVisualization = EMBED_VISUALIZATION_TYPES.includes(blockType);
  const isDataFigure = blockType === DATA_FIGURE_TYPE;

  if (!isEmbedContent && !isEmbedVisualization && !isDataFigure) return;

  const referenceUrl = isEmbedVisualization
    ? block.vis_url
    : isDataFigure
      ? block.figureUrl || block.href
      : block.url || block.href;
  const uid = getResolveUID(referenceUrl);
  const path =
    !uid && getInternalReferencePath(referenceUrl, isEmbedVisualization);
  const previewUrl =
    getDirectBlockPreviewUrl(block) ||
    (isEmbedVisualization && path
      ? `${path}${PLOTLY_PREVIEW_PATH}`
      : isDataFigure && block.url
        ? flattenToAppURL(block.url)
        : isEmbedContent && isPreviewImageURL(referenceUrl)
          ? flattenToAppURL(referenceUrl)
          : undefined);

  return {
    ...(uid ? { uid } : {}),
    ...(path ? { path } : {}),
    ...(referenceUrl ? { url: referenceUrl } : {}),
    ...(previewUrl ? { previewUrl } : {}),
  };
};

export const getEmbedContentReferences = (value, visited = new Set()) => {
  if (!value || typeof value !== 'object' || visited.has(value)) return [];
  visited.add(value);

  const reference = getVisualizationReference(value);
  if (reference) return [reference];

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
  const embeddedContentByPath = new Map(
    embeddedContents.map((content) => [getIndicatorPath(content), content]),
  );
  const embeddedContentReferences = getEmbedContentReferences(indicatorContent);

  for (const {
    uid,
    path,
    previewUrl: directPreviewUrl,
  } of embeddedContentReferences) {
    if (directPreviewUrl) return directPreviewUrl;

    const previewUrl = getEmbeddedContentPreviewUrl(
      uid ? embeddedContentByUID.get(uid) : embeddedContentByPath.get(path),
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
          getEmbedContentReferences(indicator)
            .filter(({ uid, previewUrl }) => uid && !previewUrl)
            .map(({ uid }) => uid),
        ),
      ),
    ],
    [indicatorContents],
  );
  const embeddedContentPaths = useMemo(
    () => [
      ...new Set(
        indicatorContents.flatMap((indicator) =>
          getEmbedContentReferences(indicator)
            .filter(({ uid, path, previewUrl }) => !uid && path && !previewUrl)
            .map(({ path }) => path),
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
  const embeddedContentPathSubrequestId = useMemo(
    () => getEmbeddedContentPathSubrequestId(block, embeddedContentPaths),
    [block, embeddedContentPaths],
  );
  const embeddedContentPathRequest = useSelector(
    (state) => state.search?.subrequests?.[embeddedContentPathSubrequestId],
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

  useEffect(() => {
    if (
      embeddedContentPaths.length > 0 &&
      !embeddedContentPathRequest?.loading &&
      !embeddedContentPathRequest?.loaded &&
      !embeddedContentPathRequest?.error
    ) {
      dispatch(
        searchContent(
          '',
          {
            path: embeddedContentPaths,
            'path.depth': 0,
            b_size: Math.min(Math.max(embeddedContentPaths.length, 25), 1000),
            metadata_fields: ['UID', 'image_field', 'image_scales'],
          },
          embeddedContentPathSubrequestId,
        ),
      );
    }
  }, [
    dispatch,
    embeddedContentPathRequest?.error,
    embeddedContentPathRequest?.loaded,
    embeddedContentPathRequest?.loading,
    embeddedContentPathSubrequestId,
    embeddedContentPaths,
  ]);

  const embeddedContents = [
    ...(embeddedContentRequest?.items || []),
    ...(embeddedContentPathRequest?.items || []),
  ];

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
