import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';
import { getImageScaleParams } from '@eeacms/volto-object-widget/helpers';

// The card preview image is picked by content type:
// - Plotly charts ("Chart (interactive)") use the generated Plotly preview
// - Indicators use their lead image or the first embedded figure preview
// - everything else uses the item preview / lead image
export const PLOTLY_TYPES = ['visualization'];
export const INDICATOR_TYPE = 'ims_indicator';

const EMBED_CONTENT_TYPE = 'embed_content';
const EMBED_VISUALIZATION_TYPES = ['embed_visualization', 'embed_chart'];
const DATA_FIGURE_TYPE = 'dataFigure';
export const PLOTLY_PREVIEW_PATH = '/@@plotly_preview.svg/soer_miniature';

export const getPlotlyPreviewUrl = (item) =>
  `${item['@id']}${PLOTLY_PREVIEW_PATH}`;

/**
 * Preview url that only depends on the item content type. Indicators need
 * extra requests, see useIndicatorPreviews.
 */
export const getContentTypePreviewUrl = (item) =>
  item?.['@id'] && PLOTLY_TYPES.includes(item['@type'])
    ? getPlotlyPreviewUrl(item)
    : undefined;

export const getItemPath = (item) =>
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

/**
 * Returns the embedded figure references of a content, in block order.
 */
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

/**
 * Indicator preview candidates, best first: its own lead image, then the
 * previews of the embedded figures in block order. Some embedded figures
 * point to images that do not exist anymore, so the card falls back to the
 * next candidate when an image fails to load.
 */
export const getIndicatorPreviewUrls = (
  indicator,
  indicatorContents = [],
  embeddedContents = [],
) => {
  const indicatorPath = getItemPath(indicator);
  const indicatorContent =
    indicatorContents.find((item) => getItemPath(item) === indicatorPath) ||
    indicator;

  const urls = [
    getLeadImagePreviewUrl(indicatorContent) ||
      getLeadImagePreviewUrl(indicator),
  ];

  const embeddedContentByUID = new Map(
    embeddedContents.map((content) => [content.UID, content]),
  );
  const embeddedContentByPath = new Map(
    embeddedContents.map((content) => [getItemPath(content), content]),
  );

  for (const {
    uid,
    path,
    previewUrl: directPreviewUrl,
  } of getEmbedContentReferences(indicatorContent)) {
    urls.push(
      directPreviewUrl ||
        getEmbeddedContentPreviewUrl(
          uid ? embeddedContentByUID.get(uid) : embeddedContentByPath.get(path),
        ),
    );
  }

  return [...new Set(urls.filter(Boolean))];
};

/**
 * Indicator preview: its own lead image, otherwise the preview of the first
 * embedded figure that has one.
 */
export const getIndicatorPreviewUrl = (...args) =>
  getIndicatorPreviewUrls(...args)[0];
