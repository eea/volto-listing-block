import { getTeaserImageURL } from './utils';
import { isInternalURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

beforeAll(() => {
  config.blocks.blocksConfig = {
    ...config.blocks.blocksConfig,
    teaser: {
      ...config.blocks.blocksConfig.teaser,
      imageScale: 'test_scale',
    },
  };
});

jest.mock('@plone/volto/helpers', () => ({
  isInternalURL: jest.fn(),
}));

describe('test', () => {
  it('should return the scaled image URL if image is provided and is an internal URL', () => {
    const image = {
      '@id': 'internalURL',
    };
    isInternalURL.mockReturnValue(true);
    const result = getTeaserImageURL('', image);

    expect(isInternalURL).toHaveBeenCalledWith('internalURL');
    expect(result).toBe(`internalURL/@@images/image/test_scale`);
  });

  it('should return the image URL if image is provided and is not an internal URL', () => {
    const image = {
      '@id': 'internalURL',
    };
    isInternalURL.mockReturnValue(false);
    const result = getTeaserImageURL('', image);

    expect(isInternalURL).toHaveBeenCalledWith('internalURL');
    expect(result).toBe('internalURL');
  });

  it('should return the default image URL if no image is provided without image_field', () => {
    const href = {
      '@id': 'https://example.com/item',
      image_field: null,
    };
    const result = getTeaserImageURL(href, '');

    expect(result).toBe(
      'https://example.com/item/@@images/preview_image/test_scale',
    );
  });

  it('should return the default image URL if no image is provided with image_field', () => {
    const href = {
      '@id': 'https://example.com/item',
      image_field: 'mock_image',
    };
    const result = getTeaserImageURL(href, '');

    expect(result).toBe(
      'https://example.com/item/@@images/mock_image/test_scale',
    );
  });
});
