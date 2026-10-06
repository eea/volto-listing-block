import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';

import { CardActionProvider } from './CardAction';
import CardTitle from './CardTitle';
import CardImage from './CardImage';
import CardExtra from './CardExtra';

jest.mock('./RenderBlocksWrapper', () => ({ location }) => (
  <div data-testid="popup-content">{location.pathname}</div>
));

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      publicURL: 'http://localhost:3000',
      apiPath: 'http://localhost:3000',
      hashLinkSmoothScroll: false,
      styleClassNameConverters: {},
    },
    blocks: {
      blocksConfig: {
        teaser: { renderTag: (tag, i) => <span key={i}>{tag}</span> },
      },
    },
  },
}));

const mockStore = configureStore([]);

const item = {
  '@id': 'http://localhost:3000/my-chart',
  title: 'My chart',
};

const renderCard = ({ itemModel = {}, isEditMode, width = 1024 } = {}) => {
  const model = {
    callToAction: { enable: true, label: 'Read more' },
    ...itemModel,
  };
  const props = { item, itemModel: model, isEditMode };
  return render(
    <Provider
      store={mockStore({ screen: { width }, userSession: { token: null } })}
    >
      <MemoryRouter>
        <CardActionProvider {...props}>
          <CardImage {...props} />
          <CardTitle {...props} />
          <CardExtra {...props} />
        </CardActionProvider>
      </MemoryRouter>
    </Provider>,
  );
};

const getLinks = (container) =>
  Array.from(container.querySelectorAll('a')).map((a) =>
    a.getAttribute('href'),
  );

describe('card action', () => {
  it('links the title, the image and the CTA to the item', () => {
    const { container } = renderCard();
    expect(getLinks(container)).toEqual([
      '/my-chart',
      '/my-chart',
      '/my-chart',
    ]);
    expect(container.querySelector('a.image img')).toBeInTheDocument();
    expect(container.querySelector('a.header-link')).toHaveTextContent(
      'My chart',
    );
  });

  it('uses the CTA destination for all entry points', () => {
    const { container } = renderCard({
      itemModel: {
        callToAction: {
          enable: true,
          urlTemplate: '$URL/@@details',
        },
      },
    });
    expect(getLinks(container)).toEqual([
      '/my-chart/@@details',
      '/my-chart/@@details',
      '/my-chart/@@details',
    ]);
  });

  it('keeps the title and image links when the CTA button is hidden', () => {
    const { container } = renderCard({
      itemModel: { callToAction: { enable: false } },
    });
    expect(getLinks(container)).toEqual(['/my-chart', '/my-chart']);
    expect(screen.queryByText('Read more')).toBeNull();
  });

  it('opens the same popup from every entry point on large screens', () => {
    const { container } = renderCard({
      itemModel: { enableCTAPopup: true },
      width: 1280,
    });
    fireEvent.click(container.querySelector('a.header-link'));
    expect(screen.getByTestId('popup-content')).toHaveTextContent('/my-chart');
  });

  it('navigates instead of opening the popup on small screens', () => {
    const { container } = renderCard({
      itemModel: { enableCTAPopup: true },
      width: 1024,
    });
    fireEvent.click(container.querySelector('a.image'));
    expect(screen.queryByTestId('popup-content')).toBeNull();
  });

  it('renders no links in edit mode', () => {
    const { container } = renderCard({ isEditMode: true });
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.querySelector('div.image img')).toBeInTheDocument();
    expect(screen.getByText('Read more').tagName).toBe('BUTTON');
  });

  describe('external link', () => {
    const external = 'https://example.org/report';
    const renderExternal = (itemModel, extra = {}) => {
      const props = {
        item: { ...item, external_link: external, ...extra },
        itemModel: {
          callToAction: { enable: true, label: 'Read more' },
          ...itemModel,
        },
      };
      return render(
        <Provider
          store={mockStore({ screen: { width: 1024 }, userSession: {} })}
        >
          <MemoryRouter>
            <CardActionProvider {...props}>
              <CardImage {...props} />
              <CardTitle {...props} />
              <CardExtra {...props} />
            </CardActionProvider>
          </MemoryRouter>
        </Provider>,
      ).container;
    };

    it('links title, image and CTA to the external link', () => {
      expect(getLinks(renderExternal())).toEqual([
        external,
        external,
        external,
      ]);
    });

    it('works without a linked content item', () => {
      expect(getLinks(renderExternal({}, { '@id': undefined }))).toEqual([
        external,
        external,
        external,
      ]);
    });

    it('gives the CTA link precedence', () => {
      const container = renderExternal({
        callToAction: {
          enable: true,
          label: 'Read more',
          href: [{ '@id': '/en/cta-page' }],
        },
      });
      expect(new Set(getLinks(container))).toEqual(new Set(['/en/cta-page']));
    });

    it('gives the CTA URL template precedence', () => {
      const container = renderExternal({
        callToAction: {
          enable: true,
          label: 'Read more',
          urlTemplate: '$URL/details',
        },
      });
      expect(new Set(getLinks(container))).toEqual(
        new Set(['/my-chart/details']),
      );
    });
  });

  it('does not wrap titles that already are links', () => {
    const props = {
      item: { '@id': '/x', title: <a href="/search-result">Result</a> },
      itemModel: {},
    };
    const { container } = render(
      <Provider store={mockStore({ screen: {}, userSession: {} })}>
        <MemoryRouter>
          <CardActionProvider {...props}>
            <CardTitle {...props} />
          </CardActionProvider>
        </MemoryRouter>
      </Provider>,
    );
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      '/search-result',
    );
  });
});
