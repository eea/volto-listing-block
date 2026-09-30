import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardImage from './CardImage';

// the link behaviour is covered by CardAction.test.jsx
jest.mock('./RenderBlocksWrapper', () => () => null);

jest.mock('@eeacms/volto-listing-block/PreviewImage', () => {
  return jest.fn(({ preview_image_url, alt, label }) => (
    <div data-testid="preview-image">
      <span data-testid="preview-image-url">{preview_image_url}</span>
      <span data-testid="preview-image-alt">{alt}</span>
      <span data-testid="preview-image-label">{JSON.stringify(label)}</span>
    </div>
  ));
});

beforeEach(() => {
  jest.clearAllMocks();
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
    preview_image_url: 'https://example.com/test-image.jpg',
    itemModel: {
      titleOnImage: true,
      hasLabel: true,
    },
  };

  const getLabel = () =>
    JSON.parse(screen.getByTestId('preview-image-label').textContent);

  it('renders the image in a plain wrapper without a card action', () => {
    const { container } = render(<CardImage {...mockProps} />);
    expect(container.querySelector('div.image')).toBeInTheDocument();
    expect(container.querySelector('a')).toBeNull();
  });

  it('renders the title on the image with an empty alt', () => {
    const { container } = render(<CardImage {...mockProps} />);
    expect(container.querySelector('.gradient')).toHaveTextContent('Test Item');
    expect(screen.getByTestId('preview-image-alt')).toHaveTextContent('');
  });

  it('uses the title as alt when it is not displayed on the image', () => {
    const { container } = render(
      <CardImage {...mockProps} itemModel={{ titleOnImage: false }} />,
    );
    expect(container.querySelector('.gradient')).toBeNull();
    expect(screen.getByTestId('preview-image-alt')).toHaveTextContent(
      'Test Item',
    );
  });

  it('renders the "New" label', () => {
    render(<CardImage {...mockProps} item={{ ...mockItem, isNew: true }} />);
    expect(getLabel()).toEqual({ text: 'New', side: true, color: 'green' });
  });

  it('renders the "Archived" label', () => {
    render(
      <CardImage {...mockProps} item={{ ...mockItem, isExpired: true }} />,
    );
    expect(getLabel()).toEqual({
      text: 'Archived',
      side: true,
      color: 'yellow',
    });
  });

  it('does not render the label when hasLabel is off', () => {
    render(
      <CardImage
        {...mockProps}
        item={{ ...mockItem, isNew: true }}
        itemModel={{ hasLabel: false }}
      />,
    );
    expect(getLabel()).toBeNull();
  });

  it('passes preview_image_url to PreviewImage', () => {
    render(<CardImage {...mockProps} />);
    expect(screen.getByTestId('preview-image-url')).toHaveTextContent(
      'https://example.com/test-image.jpg',
    );
  });

  it('handles a missing itemModel and title', () => {
    render(<CardImage item={{ '@id': '/x' }} />);
    expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    expect(screen.getByTestId('preview-image-alt')).toHaveTextContent('');
  });
});
