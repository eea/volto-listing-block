import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContent } from '@plone/volto/actions/search/search';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

import {
  INDICATOR_TYPE,
  getEmbedContentReferences,
  getIndicatorPreviewUrls,
} from './preview';

const INDICATOR_PREVIEW_METADATA_FIELDS = [
  'UID',
  'getPath',
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
const NO_PREVIEW = {};

const unique = (values) => [...new Set(values)];

const withSitePath = (sitePath, paths) =>
  sitePath ? paths.map((path) => `${sitePath}${path}`) : paths;

/**
 * Catalog paths are physical paths, which differ from the app paths when the
 * site is not virtual hosted at its root (e.g. /www/en/... locally, /en/...
 * in production). Derive the prefix from a found content.
 */
export const getSitePath = (contents) => {
  for (const content of contents) {
    const physicalPath = content?.getPath;
    const appPath = flattenToAppURL(content?.['@id'] || '');
    if (physicalPath && appPath && physicalPath.endsWith(appPath)) {
      return physicalPath.slice(0, physicalPath.length - appPath.length);
    }
  }
  return '';
};

/**
 * Resolves the preview image of the indicators (ims_indicator) among
 * `items`: their lead image, or the preview of the first embedded figure.
 * Requests are batched for all the items of a listing.
 *
 * Returns a function `item => props` with the card preview props:
 * `preview_image_url` and the `preview_image_fallbacks` to try when it fails
 * to load. Empty for other content types.
 */
export default function useIndicatorPreviews(items, block) {
  const indicators = React.useMemo(
    () =>
      (items || []).filter(
        (item) => item?.['@type'] === INDICATOR_TYPE && item['@id'],
      ),
    [items],
  );
  // listing results have an UID, which works the same in every environment
  const indicatorUIDs = React.useMemo(
    () => unique(indicators.filter(({ UID }) => UID).map(({ UID }) => UID)),
    [indicators],
  );
  // e.g. teasers saved without UID
  const indicatorPaths = React.useMemo(
    () =>
      unique(
        indicators
          .filter(({ UID }) => !UID)
          .map((item) => flattenToAppURL(item['@id'])),
      ),
    [indicators],
  );

  const indicatorsByUID =
    useCatalogSubrequest('indicators', block, indicatorUIDs, (uids) => ({
      portal_type: INDICATOR_TYPE,
      UID: uids,
      b_size: getBatchSize(uids),
      metadata_fields: INDICATOR_PREVIEW_METADATA_FIELDS,
    })) ?? EMPTY;
  const indicatorsByPath =
    useCatalogSubrequest('indicator-paths', block, indicatorPaths, (paths) => ({
      portal_type: INDICATOR_TYPE,
      path: paths,
      'path.depth': 0,
      b_size: getBatchSize(paths),
      metadata_fields: INDICATOR_PREVIEW_METADATA_FIELDS,
    })) ?? EMPTY;
  const indicatorContents = React.useMemo(
    () =>
      indicatorsByPath.length
        ? [...indicatorsByUID, ...indicatorsByPath]
        : indicatorsByUID,
    [indicatorsByUID, indicatorsByPath],
  );
  const sitePath = React.useMemo(
    () => getSitePath(indicatorContents),
    [indicatorContents],
  );

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
      withSitePath(
        sitePath,
        unique(
          references
            .filter(({ uid, path, previewUrl }) => !uid && path && !previewUrl)
            .map(({ path }) => path),
        ),
      ),
    [references, sitePath],
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
    (item) => {
      if (item?.['@type'] !== INDICATOR_TYPE) return NO_PREVIEW;
      const [url, ...fallbacks] = getIndicatorPreviewUrls(
        item,
        indicatorContents,
        [...embeddedByUID, ...embeddedByPath],
      );
      return url
        ? { preview_image_url: url, preview_image_fallbacks: fallbacks }
        : NO_PREVIEW;
    },
    [indicatorContents, embeddedByUID, embeddedByPath],
  );
}
