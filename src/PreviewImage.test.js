import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreviewImage from './PreviewImage';
import * as helpers from '@eeacms/volto-object-widget/helpers';

jest.mock('@eeacms/volto-object-widget/helpers', () => ({
  getImageScaleParams: jest.fn(),
}));

describe('PreviewImage', () => {
  const testItem = {
    title: 'Test Item',
    image_field: {
      scales: {
        preview: { download: 'http://example.com/preview.jpg' },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    helpers.getImageScaleParams.mockImplementation((item, size) => {
      if (Array.isArray(item)) {
        return { download: item[0].download };
      }
      return { download: item.image_field?.scales?.[size]?.download || 'default-image.svg' };
    });
  });

  it('renders with preview_image_url', () => {
    render(
      <PreviewImage
        item={testItem}
        preview_image_url="http://example.com/custom.jpg"
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/custom.jpg');
    expect(img).toHaveAttribute('alt', 'Test Item');
    expect(helpers.getImageScaleParams).not.toHaveBeenCalled();
  });

  it('renders with preview_image', () => {
    const previewImage = [{ download: 'http://example.com/other.jpg' }];
    render(
      <PreviewImage
        item={testItem}
        preview_image={previewImage}
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://example.com/other.jpg');
    expect(helpers.getImageScaleParams).toHaveBeenCalledWith(
      previewImage,
      'preview'
    );
  });

  it('renders with item.image_field', () => {
    render(
      <PreviewImage item={testItem} size="preview" />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://example.com/preview.jpg');
    expect(helpers.getImageScaleParams).toHaveBeenCalledWith(
      testItem,
      'preview'
    );
  });

  it('renders default image when no source available', () => {
    render(
      <PreviewImage item={{ title: 'No Image' }} />,
    );
    const img = screen.getByRole('img');
    expect(img.src).toContain('default-image.svg');
  });

  it('renders label when provided', () => {
    render(
      <PreviewImage
        item={testItem}
        label={{ text: 'Test Label', side: 'right', color: 'blue' }}
      />,
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
});
