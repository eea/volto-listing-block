import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContent } from '@plone/volto/actions/search/search';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

import {
  INDICATOR_TYPE,
  getEmbedContentReferences,
  getIndicatorPreviewUrl,
} from './preview';

const INDICATOR_PREVIEW_METADATA_FIELDS = [
  'blocks',
  'blocks_layout',
  'image',
  'image_field',
  'image_scales',
];
const EMBEDDED_PREVIEW_METADATA_FIELDS = ['UID', 'image_field', 'image_scales'];

const hashValues = (values) =>
  values
    .join('|')
    .split('')
    .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0)
    .toString(36);

export const getSubrequestId = (kind, block, values) =>
  `card-preview-${kind}-${block || 'listing'}-${hashValues(values)}`;

const getBatchSize = (values) => Math.min(Math.max(values.length, 25), 1000);

// Runs one catalog search (stored as a subrequest) when `values` is not empty
const useCatalogSubrequest = (kind, block, values, buildQuery) => {
  const dispatch = useDispatch();
  const subrequestId = React.useMemo(
    () => getSubrequestId(kind, block, values),
    [kind, block, values],
  );
  const request = useSelector(
    (state) => state.search?.subrequests?.[subrequestId],
  );
  const shouldFetch =
    values.length > 0 &&
    !request?.loading &&
    !request?.loaded &&
    !request?.error;

  React.useEffect(() => {
    if (shouldFetch) {
      dispatch(searchContent('', buildQuery(values), subrequestId));
    }
    // buildQuery is a static function per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, shouldFetch, subrequestId, values]);

  return request?.items;
};

const EMPTY = [];

const unique = (values) => [...new Set(values)];

/**
 * Resolves the preview image of the indicators (ims_indicator) among
 * `items`: their lead image, or the preview of the first embedded figure.
 * Requests are batched for all the items of a listing.
 *
 * Returns a function `item => previewUrl | undefined`.
 */
export default function useIndicatorPreviews(items, block) {
  const indicatorPaths = React.useMemo(
    () =>
      (items || [])
        .filter((item) => item?.['@type'] === INDICATOR_TYPE && item['@id'])
        .map((item) => flattenToAppURL(item['@id'])),
    [items],
  );

  const indicatorContents =
    useCatalogSubrequest('indicators', block, indicatorPaths, (paths) => ({
      portal_type: INDICATOR_TYPE,
      path: paths,
      'path.depth': 0,
      b_size: getBatchSize(paths),
      metadata_fields: INDICATOR_PREVIEW_METADATA_FIELDS,
    })) ?? EMPTY;

  const references = React.useMemo(
    () =>
      indicatorContents.flatMap((indicator) =>
        getEmbedContentReferences(indicator),
      ),
    [indicatorContents],
  );
  const embeddedUIDs = React.useMemo(
    () =>
      unique(
        references
          .filter(({ uid, previewUrl }) => uid && !previewUrl)
          .map(({ uid }) => uid),
      ),
    [references],
  );
  const embeddedPaths = React.useMemo(
    () =>
      unique(
        references
          .filter(({ uid, path, previewUrl }) => !uid && path && !previewUrl)
          .map(({ path }) => path),
      ),
    [references],
  );

  const embeddedByUID =
    useCatalogSubrequest('embedded-uids', block, embeddedUIDs, (uids) => ({
      UID: uids,
      b_size: getBatchSize(uids),
      metadata_fields: EMBEDDED_PREVIEW_METADATA_FIELDS,
    })) ?? EMPTY;
  const embeddedByPath =
    useCatalogSubrequest('embedded-paths', block, embeddedPaths, (paths) => ({
      path: paths,
      'path.depth': 0,
      b_size: getBatchSize(paths),
      metadata_fields: EMBEDDED_PREVIEW_METADATA_FIELDS,
    })) ?? EMPTY;

  return React.useCallback(
    (item) =>
      item?.['@type'] === INDICATOR_TYPE
        ? getIndicatorPreviewUrl(item, indicatorContents, [
            ...embeddedByUID,
            ...embeddedByPath,
          ])
        : undefined,
    [indicatorContents, embeddedByUID, embeddedByPath],
  );
}
