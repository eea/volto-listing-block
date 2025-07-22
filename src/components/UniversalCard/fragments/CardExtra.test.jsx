import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import CardExtra from './CardExtra';

// Mock the dependencies
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      publicURL: 'https://example.com',
    },
    blocks: {
      blocksConfig: {
        teaser: {
          renderTag: (tag, i) => (
            <span key={i} className="ui label">
              {tag}
            </span>
          ),
        },
      },
    },
  },
}));

jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: jest.fn((url) => url),
}));

// Mock RenderBlocksWrapper component
jest.mock('./RenderBlocksWrapper', () =>
  jest.fn(() => <div data-testid="render-blocks-wrapper" />),
);

const mockStore = configureStore([]);

describe('CardExtra Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      screen: {
        width: 1920, // Default to desktop width
      },
    });
  });

  // Test CardExtra component
  describe('CardExtra', () => {
    it('renders null when no showCallToAction and no showTags', () => {
      const item = { '@id': '/test-item' };
      const itemModel = { callToAction: {}, hasTags: false };

      const { container } = render(
        <CardExtra item={item} itemModel={itemModel} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders tags when showTags is true and item has Subject', () => {
      const item = {
        '@id': '/test-item',
        Subject: ['Tag1', 'Tag2'],
      };
      const itemModel = { hasTags: true, callToAction: {} };

      render(<CardExtra item={item} itemModel={itemModel} />);

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
    });

    it('does not render tags when showTags is true but item has no Subject', () => {
      const item = { '@id': '/test-item' };
      const itemModel = { hasTags: true, callToAction: {} };

      const { container } = render(
        <CardExtra item={item} itemModel={itemModel} />,
      );

      expect(container.querySelector('.tags.labels')).not.toBeInTheDocument();
    });

    it('renders call to action button when showCallToAction is true', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          label: 'Click Me',
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('uses default "Read more" label when no label is provided', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      expect(screen.getByText('Read more')).toBeInTheDocument();
    });

    it('renders LinkCTAButton when enableCTAPopup is false', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          label: 'Click Me',
        },
        enableCTAPopup: false,
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Click Me');
      expect(button.tagName).toBe('A'); // LinkCTAButton renders an anchor tag
    });

    it('renders PopupCTAButton when enableCTAPopup is true', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          label: 'Click Me',
        },
        enableCTAPopup: true,
      };

      render(
        <Provider store={store}>
          <CardExtra item={item} itemModel={itemModel} />
        </Provider>,
      );

      const button = screen.getByText('Click Me');
      expect(button.tagName).toBe('BUTTON'); // PopupCTAButton renders a button tag
    });

    it('opens modal when PopupCTAButton is clicked', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          label: 'Click Me',
        },
        enableCTAPopup: true,
      };

      render(
        <Provider store={store}>
          <CardExtra item={item} itemModel={itemModel} />
        </Provider>,
      );

      const button = screen.getByText('Click Me');
      fireEvent.click(button);

      // Modal should be open
      expect(screen.getByTestId('render-blocks-wrapper')).toBeInTheDocument();
    });

    it('falls back to LinkCTAButton on mobile screens', () => {
      // Set screen width to mobile size
      store = mockStore({
        screen: {
          width: 768, // Mobile width
        },
      });

      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          label: 'Click Me',
        },
        enableCTAPopup: true,
      };

      render(
        <Provider store={store}>
          <CardExtra item={item} itemModel={itemModel} />
        </Provider>,
      );

      const button = screen.getByText('Click Me');
      expect(button.tagName).toBe('A'); // Should fall back to LinkCTAButton (anchor tag)
    });

    it('uses urlTemplate when provided', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          urlTemplate: '$PORTAL_URL/custom/$URL',
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Read more');
      expect(button.getAttribute('href')).toBe(
        'https://example.com/custom//test-item',
      );
    });

    it('uses href when provided and no urlTemplate', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
          href: [{ '@id': '/custom-link' }],
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Read more');
      expect(button.getAttribute('href')).toBe('/custom-link');
    });

    it('falls back to item @id when no urlTemplate or href', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Read more');
      expect(button.getAttribute('href')).toBe('/test-item');
    });

    it('applies theme class to button when provided', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
        },
        styles: {
          'theme:noprefix': 'primary',
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Read more');
      expect(button.className).toContain('primary');
    });

    it('applies inverted class to button when inverted is true', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
        },
        styles: {
          'theme:noprefix': 'primary',
          'inverted:bool': true,
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Read more');
      expect(button.className).toContain('primary inverted');
    });

    it('applies basic black class when inverted is true but no theme', () => {
      const item = { '@id': '/test-item' };
      const itemModel = {
        callToAction: {
          enable: true,
        },
        styles: {
          'inverted:bool': true,
        },
      };

      render(<CardExtra item={item} itemModel={itemModel} />);

      const button = screen.getByText('Read more');
      expect(button.className).toContain('basic black');
    });
  });
});
