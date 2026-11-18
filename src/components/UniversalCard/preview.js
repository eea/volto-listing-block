import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { getImageScaleParams } from '@eeacms/volto-object-widget/helpers';

// The card preview image is picked by content type:
// - Plotly charts ("Chart (interactive)") use the generated Plotly preview
// - Indicators use their lead image or the preview of their first chart
// - everything else uses the item preview / lead image
export const PLOTLY_TYPES = ['visualization'];
export const INDICATOR_TYPE = 'ims_indicator';
export const PLOTLY_PREVIEW_PATH = '/@@plotly_preview.svg/soer_miniature';

export const getPlotlyPreviewUrl = (item) =>
  `${item['@id']}${PLOTLY_PREVIEW_PATH}`;

export const isChartItem = (item) => PLOTLY_TYPES.includes(item?.['@type']);

// How interactive charts are previewed: with their own preview image (the
// whole chart) or with the miniature generated from the chart, made for the
// small charts of the cards (the former Visualization Cards)
export const CHART_PREVIEW_IMAGE = 'image';
export const CHART_PREVIEW_MINIATURE = 'miniature';

export const getChartPreview = (itemModel = {}) =>
  itemModel.chartPreview ??
  (itemModel['@type'] === 'item'
    ? CHART_PREVIEW_IMAGE
    : CHART_PREVIEW_MINIATURE);

/**
 * Preview url that only depends on the item content type. Indicators need
 * extra requests, see useIndicatorPreviews. A chart without its own preview
 * image uses the miniature.
 */
export const getContentTypePreviewUrl = (item, itemModel) =>
  item?.['@id'] &&
  isChartItem(item) &&
  (getChartPreview(itemModel) === CHART_PREVIEW_MINIATURE || !item.image_field)
    ? getPlotlyPreviewUrl(item)
    : undefined;

/**
 * The app path of a content. Its url can be absolute on another host than the
 * configured one (e.g. a proxied backend, or a teaser saved on another
 * environment), so the pathname is used.
 */
export const getItemPath = (item) => {
  const url = flattenToAppURL(item?.['@id'] || '');
  if (!/^https?:\/\//i.test(url)) return url.replace(/\/$/, '');
  try {
    return new URL(url).pathname.replace(/\/$/, '');
  } catch {
    return '';
  }
};

export const getParentPath = (item) =>
  getItemPath(item).replace(/\/[^/]*$/, '');

// The indicators have no preview of their own, but their charts (their
// children: interactive charts, static charts and maps) have a preview image
export const CHILD_PREVIEW_FIELD = 'preview_image';

const isPublished = (item) =>
  !item?.review_state || item.review_state === 'published';

const getLeadImagePreviewUrl = (indicator) => {
  if (!indicator?.image && !indicator?.image_field) return;
  return getImageScaleParams(indicator, 'preview')?.download;
};

export const getChildPreviewUrl = (child) => {
  if (!child?.['@id'] || !child.image_scales?.[CHILD_PREVIEW_FIELD]?.[0]) {
    return;
  }
  return getImageScaleParams(
    { ...child, '@id': getItemPath(child), image_field: CHILD_PREVIEW_FIELD },
    'preview',
  )?.download;
};

/**
 * Indicator preview candidates, best first: its own lead image, then the
 * preview images of its children in folder order, the published ones first.
 * The card falls back to the next candidate when an image fails to load.
 *
 * `children` are catalog results (in folder order) that can belong to other
 * indicators too.
 */
export const getIndicatorPreviewUrls = (indicator, children = []) => {
  const indicatorPath = getItemPath(indicator);
  const ownChildren = indicatorPath
    ? children.filter((child) => getParentPath(child) === indicatorPath)
    : [];

  const urls = [
    getLeadImagePreviewUrl(indicator),
    ...ownChildren.filter(isPublished).map(getChildPreviewUrl),
    ...ownChildren
      .filter((child) => !isPublished(child))
      .map(getChildPreviewUrl),
  ];

  return [...new Set(urls.filter(Boolean))];
};

/**
 * Indicator preview: its own lead image, otherwise the preview image of its
 * first published child that has one.
 */
export const getIndicatorPreviewUrl = (...args) =>
  getIndicatorPreviewUrls(...args)[0];
