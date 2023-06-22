import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import config from '@plone/volto/registry';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';

export const getFieldURL = (data) => {
  let url = data;
  const _isObject = data && isObject(data) && !isArray(data);
  if (_isObject && data['@type'] === 'URL') {
    url = data['value'] ?? data['url'] ?? data['href'] ?? data;
  } else if (_isObject) {
    url = data['@id'] ?? data['url'] ?? data['href'] ?? data;
  }
  if (isArray(data)) {
    url = data.map((item) => getFieldURL(item));
  }
  if (isString(url) && isInternalURL(url)) return flattenToAppURL(url);
  return url;
};

export function getImageScaleParams(image, size) {
  const imageScale =
    config.blocks.blocksConfig['teaser'].imageScale || size || 'preview'; //listings use preview scale

  if (isInternalURL(image['@id'])) {
    if (image?.image_scales?.[image?.image_field]) {
      const scale =
        image.image_scales[image.image_field]?.[0].scales[imageScale] ||
        image.image_scales[image.image_field]?.[0];

      const url = flattenToAppURL(`${image['@id']}/${scale?.download}`);
      const width = scale?.width;
      const height = scale?.height;

      return {
        url,
        width,
        height,
      };
    } else {
      return flattenToAppURL(
        `${image['@id']}/@@images/${image.image_field}/${imageScale}`,
      );
    }
  } else {
    return image['@id'];
  }
}

export const setImageSize = (image, imageParams, size) => {
  const imageScaled = isInternalURL(image)
    ? (() => {
        if (imageParams) {
          const { scales = null } = imageParams;
          if (scales) {
            if (size === 'big') return scales.huge;
            if (size === 'medium') return scales.large;
            if (size === 'small') return scales.mini;
            if (size === 'preview') return scales.preview;
            if (size === 'tiny') return scales.thumb;
            return scales.large;
          } else
            return {
              download: imageParams?.download,
              width: imageParams?.width,
              height: imageParams?.height,
            };
        }
      })()
    : { download: image, width: '100%', height: '100%' };

  return imageScaled;
};
