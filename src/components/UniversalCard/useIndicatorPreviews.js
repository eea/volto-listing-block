import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContent } from '@plone/volto/actions/search/search';

import {
  INDICATOR_TYPE,
  getIndicatorPreviewUrls,
  getItemPath,
} from './preview';

// Only catalog metadata: since plone.restapi 9.15.7 the search results drop
// the requested fields that are not catalog columns (e.g. `blocks`)
const CHILD_PREVIEW_METADATA_FIELDS = ['image_field', 'image_scales'];
// the indicators have 2-4 charts, the few extra ones keep their folder order
const CHILDREN_PER_INDICATOR = 10;

const hashValues = (values) =>
  values
    .join('|')
    .split('')
    .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0)
    .toString(36);

export const getSubrequestId = (kind, block, values) =>
  `card-preview-${kind}-${block || 'listing'}-${hashValues(values)}`;

const getBatchSize = (count) => Math.min(Math.max(count, 25), 1000);

/**
 * The catalog query for the children of the indicators, in folder order.
 * Paths are app paths: plone.restapi prefixes them with the virtual hosting
 * root.
 */
export const getChildrenQuery = (paths) => ({
  'path.query': paths,
  'path.depth': 1,
  sort_on: 'getObjPositionInParent',
  b_size: getBatchSize(paths.length * CHILDREN_PER_INDICATOR),
  metadata_fields: CHILD_PREVIEW_METADATA_FIELDS,
});

const EMPTY = [];
const NO_PREVIEW = {};

/**
 * Resolves the preview image of the indicators (ims_indicator) among
 * `items`: their lead image, or the preview image of their first published
 * child chart. One catalog search for all the indicators of a listing.
 *
 * Returns a function `item => props` with the card preview props:
 * `preview_image_url` and the `preview_image_fallbacks` to try when it fails
 * to load. Empty for other content types.
 */
export default function useIndicatorPreviews(items, block) {
  const dispatch = useDispatch();
  const indicatorPaths = React.useMemo(
    () => [
      ...new Set(
        (items || [])
          .filter((item) => item?.['@type'] === INDICATOR_TYPE)
          .map(getItemPath)
          .filter(Boolean),
      ),
    ],
    [items],
  );
  const subrequestId = React.useMemo(
    () => getSubrequestId('indicator-children', block, indicatorPaths),
    [block, indicatorPaths],
  );
  const request = useSelector(
    (state) => state.search?.subrequests?.[subrequestId],
  );
  const shouldFetch =
    indicatorPaths.length > 0 &&
    !request?.loading &&
    !request?.loaded &&
    !request?.error;

  React.useEffect(() => {
    if (shouldFetch) {
      dispatch(
        searchContent('', getChildrenQuery(indicatorPaths), subrequestId),
      );
    }
  }, [dispatch, shouldFetch, subrequestId, indicatorPaths]);

  const children = request?.items ?? EMPTY;

  return React.useCallback(
    (item) => {
      if (item?.['@type'] !== INDICATOR_TYPE) return NO_PREVIEW;
      const [url, ...fallbacks] = getIndicatorPreviewUrls(item, children);
      return url
        ? { preview_image_url: url, preview_image_fallbacks: fallbacks }
        : NO_PREVIEW;
    },
    [children],
  );
}
