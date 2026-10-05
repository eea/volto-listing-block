import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { IntlProvider } from 'react-intl';
import '@testing-library/jest-dom';
import config from '@plone/volto/registry';
import installListing from '@eeacms/volto-listing-block/blocks/Listing';
import UniversalCard from './UniversalCard';
import TeaserCardTemplate from '@eeacms/volto-listing-block/blocks/Teaser/Card';

// Title, image and call to action share one action on every card type
// (Taskman #307509): same destination, same popup, nothing in edit mode.

jest.mock('uuid', () => ({ v4: () => 'uuid' }), { virtual: true });
jest.mock('./fragments/RenderBlocksWrapper', () => ({ location }) => (
  <div data-testid="popup-content">{location.pathname}</div>
));

const ignoreThunks = () => (next) => (action) =>
  typeof action === 'function' ? undefined : next(action);
const mockStore = configureStore([ignoreThunks]);

const item = {
  '@id': '/en/charts/chart',
  '@type': 'Document',
  title: 'Chart title',
  Description: 'Chart description',
  EffectiveDate: '2023-10-05T08:21:00+02:00',
};

const cta = { enable: true, label: 'Read more', urlTemplate: '$URL/details' };
const destination = '/en/charts/chart/details';

// [itemModel, links expected: title, image, CTA]. The overlay has only the
// image (with the title on it), the compact item is one link, and the legacy
// list items keep their CTA off as they never showed one.
const CARD_TYPES = {
  'card, image on top': [{ '@type': 'card', imagePosition: 'top' }, 3],
  'card, image on the left': [{ '@type': 'card', imagePosition: 'left' }, 3],
  'card, image on the right': [{ '@type': 'card', imagePosition: 'right' }, 3],
  'card, overlay': [
    {
      '@type': 'card',
      imagePosition: 'top',
      contentMode: 'overlay',
      titleOnImage: true,
    },
    1,
  ],
  'list item': [{ '@type': 'item', imagePosition: 'left' }, 3],
  'list item, compact': [
    { '@type': 'item', imagePosition: 'none', size: 'compact' },
    2,
  ],
  'legacy visualization card': [{ '@type': 'visualizationCard' }, 3],
  'legacy image card': [{ '@type': 'imageCard', titleOnImage: true }, 1],
  'legacy listing item': [{ '@type': 'item', hasImage: true }, 2],
  'legacy simple item': [{ '@type': 'simpleItem' }, 1],
};

const renderCard = (itemModel, { width = 1024, isEditMode = false } = {}) =>
  render(
    <Provider
      store={mockStore({
        screen: { width },
        userSession: { token: null },
        search: { subrequests: {} },
        vocabularies: {},
      })}
    >
      <MemoryRouter>
        <UniversalCard
          item={item}
          itemModel={itemModel}
          isEditMode={isEditMode}
        />
      </MemoryRouter>
    </Provider>,
  ).container;

const links = (container) =>
  Array.from(container.querySelectorAll('a')).map((a) =>
    a.getAttribute('href'),
  );

describe('card link behaviour', () => {
  beforeAll(() => {
    config.settings = {
      ...(config.settings || {}),
      publicURL: 'http://localhost:3000',
      apiPath: 'http://localhost:3000',
      hashLinkSmoothScroll: false,
      dateLocale: 'en-gb',
      styleClassNameConverters: config.settings?.styleClassNameConverters || {},
    };
    config.blocks = {
      blocksConfig: {
        listing: { variations: [], extensions: {}, edit: () => null },
        teaser: { renderTag: (tag) => tag },
      },
    };
    installListing(config);
  });

  Object.entries(CARD_TYPES).forEach(([name, [model, linkCount]]) => {
    describe(name, () => {
      const itemModel = { ...model, callToAction: cta };

      it('links title, image and call to action to the same destination', () => {
        const container = renderCard(itemModel);
        const hrefs = links(container);
        expect(hrefs).toHaveLength(linkCount);
        expect(new Set(hrefs)).toEqual(new Set([destination]));
      });

      it('opens the popup from every link on large screens', () => {
        const container = renderCard(
          { ...itemModel, enableCTAPopup: true },
          { width: 1280 },
        );
        const anchors = Array.from(container.querySelectorAll('a'));
        anchors.forEach((anchor) => {
          fireEvent.click(anchor);
          expect(screen.getByTestId('popup-content')).toHaveTextContent(
            destination,
          );
        });
      });

      it('navigates instead of opening the popup on small screens', () => {
        const container = renderCard(
          { ...itemModel, enableCTAPopup: true },
          { width: 1279 },
        );
        Array.from(container.querySelectorAll('a')).forEach((anchor) =>
          fireEvent.click(anchor),
        );
        expect(screen.queryByTestId('popup-content')).toBeNull();
        expect(new Set(links(container))).toEqual(new Set([destination]));
      });

      it('does nothing in edit mode', () => {
        const container = renderCard(
          { ...itemModel, enableCTAPopup: true },
          { width: 1280, isEditMode: true },
        );
        expect(container.querySelectorAll('a')).toHaveLength(0);
        const button = screen.queryByText('Read more');
        if (button) fireEvent.click(button);
        Array.from(container.querySelectorAll('img, .header')).forEach((el) =>
          fireEvent.click(el),
        );
        expect(screen.queryByTestId('popup-content')).toBeNull();
      });
    });
  });

  describe('teaser', () => {
    const data = {
      '@type': 'teaser',
      href: [{ '@id': '/en/charts/chart', title: 'Chart title' }],
      title: 'Chart title',
      itemModel: {
        '@type': 'card',
        imagePosition: 'top',
        callToAction: {
          enable: true,
          label: 'Read more',
          href: [{ '@id': '/en/other-page' }],
        },
      },
    };
    const renderTeaser = (props = {}) =>
      render(
        <Provider
          store={mockStore({
            screen: { width: 1280 },
            userSession: { token: null },
            search: { subrequests: {} },
          })}
        >
          <IntlProvider locale="en">
            <MemoryRouter>
              <TeaserCardTemplate data={data} block="t1" {...props} />
            </MemoryRouter>
          </IntlProvider>
        </Provider>,
      ).container;

    it('links title, image and call to action to the CTA link', () => {
      const container = renderTeaser();
      expect(links(container).length).toBe(3);
      expect(new Set(links(container))).toEqual(new Set(['/en/other-page']));
    });

    it('does nothing in edit mode', () => {
      const container = renderTeaser({ isEditMode: true });
      expect(container.querySelectorAll('a')).toHaveLength(0);
    });
  });
});
