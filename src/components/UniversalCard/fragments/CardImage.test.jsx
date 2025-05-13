import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CardImage from './CardImage';

// Mock the dependencies
jest.mock('@plone/volto/components', () => ({
  ConditionalLink: ({ children, condition }) => (
    <div data-testid="conditional-link" data-condition={condition}>
      {children}
    </div>
  ),
}));

jest.mock('@eeacms/volto-listing-block/PreviewImage', () => {
  return jest.fn(({ item, preview_image, preview_image_url, alt, label }) => (
    <div data-testid="preview-image">
      <span data-testid="preview-image-item">{JSON.stringify(item)}</span>
      <span data-testid="preview-image-url">{preview_image_url}</span>
      <span data-testid="preview-image-alt">{alt}</span>
      <span data-testid="preview-image-label">{JSON.stringify(label)}</span>
    </div>
  ));
});

describe('CardImage', () => {
  const mockItem = {
    '@id': '/test-item',
    title: 'Test Item',
    isNew: false,
    isExpired: false,
  };

  const mockProps = {
    item: mockItem,
    isEditMode: false,
    preview_image: [{ download: 'test-image.jpg' }],
    preview_image_url: 'https://example.com/test-image.jpg',
    itemModel: {
      hasLink: true,
      titleOnImage: true,
      hasLabel: true,
    },
  };

  it('renders with showLink=true when not in edit mode and itemModel has hasLink and titleOnImage', () => {
    const { container } = render(<CardImage {...mockProps} />);

    // Check if ConditionalLink is rendered with correct condition
    const conditionalLink = screen.getByTestId('conditional-link');
    expect(conditionalLink).toBeInTheDocument();
    expect(conditionalLink.getAttribute('data-condition')).toBe('true');

    // Check if PreviewImage is rendered with empty alt when showLink is true
    const previewImageAlt = screen.getByTestId('preview-image-alt');
    expect(previewImageAlt).toHaveTextContent('');

    // Check if CardTitleOnImage is rendered
    expect(container.querySelector('.gradient')).toBeInTheDocument();
    expect(container.querySelector('.gradient')).toHaveTextContent('Test Item');
  });

  it('renders with showLink=false when in edit mode', () => {
    const propsInEditMode = {
      ...mockProps,
      isEditMode: true,
    };

    const { container } = render(<CardImage {...propsInEditMode} />);

    // Check if ConditionalLink is rendered with condition=false
    const conditionalLink = screen.getByTestId('conditional-link');
    expect(conditionalLink).toBeInTheDocument();
    expect(conditionalLink.getAttribute('data-condition')).toBe('false');

    // Check if PreviewImage is rendered with item title as alt when showLink is false
    const previewImageAlt = screen.getByTestId('preview-image-alt');
    expect(previewImageAlt).toHaveTextContent('Test Item');

    // Check if CardTitleOnImage is still rendered
    expect(container.querySelector('.gradient')).toBeInTheDocument();
  });

  it('renders with showLink=false when itemModel.hasLink is false', () => {
    const propsWithoutLink = {
      ...mockProps,
      itemModel: {
        ...mockProps.itemModel,
        hasLink: false,
      },
    };

    render(<CardImage {...propsWithoutLink} />);

    // Check if ConditionalLink is rendered with condition=false
    const conditionalLink = screen.getByTestId('conditional-link');
    expect(conditionalLink).toBeInTheDocument();
    expect(conditionalLink.getAttribute('data-condition')).toBe('false');

    // Check if PreviewImage is rendered with item title as alt when showLink is false
    const previewImageAlt = screen.getByTestId('preview-image-alt');
    expect(previewImageAlt).toHaveTextContent('Test Item');
  });

  it('renders with showLink=false when itemModel.titleOnImage is false', () => {
    const propsWithoutTitleOnImage = {
      ...mockProps,
      itemModel: {
        ...mockProps.itemModel,
        titleOnImage: false,
      },
    };

    const { container } = render(<CardImage {...propsWithoutTitleOnImage} />);

    // Check if ConditionalLink is rendered with condition=false
    const conditionalLink = screen.getByTestId('conditional-link');
    expect(conditionalLink).toBeInTheDocument();
    expect(conditionalLink.getAttribute('data-condition')).toBe('false');

    // Check if PreviewImage is rendered with item title as alt when showLink is false
    const previewImageAlt = screen.getByTestId('preview-image-alt');
    expect(previewImageAlt).toHaveTextContent('Test Item');

    // Check if CardTitleOnImage is not rendered when titleOnImage is false
    expect(container.querySelector('.gradient')).not.toBeInTheDocument();
  });

  it('renders with "New" label when item.isNew is true', () => {
    const propsWithNewItem = {
      ...mockProps,
      item: {
        ...mockItem,
        isNew: true,
      },
    };

    render(<CardImage {...propsWithNewItem} />);

    // Check if label is passed to PreviewImage
    const previewImageLabel = screen.getByTestId('preview-image-label');
    const labelData = JSON.parse(previewImageLabel.textContent);

    expect(labelData).toEqual({
      text: 'New',
      side: true,
      color: 'green',
    });
  });

  it('renders with "Archived" label when item.isExpired is true', () => {
    const propsWithExpiredItem = {
      ...mockProps,
      item: {
        ...mockItem,
        isExpired: true,
      },
    };

    render(<CardImage {...propsWithExpiredItem} />);

    // Check if label is passed to PreviewImage
    const previewImageLabel = screen.getByTestId('preview-image-label');
    const labelData = JSON.parse(previewImageLabel.textContent);

    expect(labelData).toEqual({
      text: 'Archived',
      side: true,
      color: 'yellow',
    });
  });

  it('does not render label when itemModel.hasLabel is false', () => {
    const propsWithoutLabel = {
      ...mockProps,
      itemModel: {
        ...mockProps.itemModel,
        hasLabel: false,
      },
    };

    render(<CardImage {...propsWithoutLabel} />);

    // Check if no label is passed to PreviewImage
    const previewImageLabel = screen.getByTestId('preview-image-label');
    expect(previewImageLabel.textContent).toBe('null');
  });

  it('passes preview_image_url to PreviewImage', () => {
    render(<CardImage {...mockProps} />);

    // Check if preview_image_url is passed to PreviewImage
    const previewImageUrl = screen.getByTestId('preview-image-url');
    expect(previewImageUrl).toHaveTextContent(
      'https://example.com/test-image.jpg',
    );
  });

  it('handles undefined itemModel gracefully', () => {
    const propsWithoutItemModel = {
      ...mockProps,
      itemModel: undefined,
    };

    render(<CardImage {...propsWithoutItemModel} />);

    // Check if ConditionalLink is rendered
    const conditionalLink = screen.getByTestId('conditional-link');
    expect(conditionalLink).toBeInTheDocument();
    // When itemModel is undefined, condition will be null
    expect(conditionalLink.getAttribute('data-condition')).toBeNull();

    // Check if PreviewImage is rendered
    expect(screen.getByTestId('preview-image')).toBeInTheDocument();
  });

  it('handles item without title gracefully', () => {
    const propsWithoutItemTitle = {
      ...mockProps,
      item: {
        ...mockItem,
        title: undefined,
      },
    };

    render(<CardImage {...propsWithoutItemTitle} />);

    // Check if PreviewImage is rendered with empty alt when title is undefined
    const previewImageAlt = screen.getByTestId('preview-image-alt');
    expect(previewImageAlt).toHaveTextContent('');
  });
});
