import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import { CardActionProvider } from '@eeacms/volto-listing-block/components/UniversalCard';
import CardTemplate from './CardTemplate';

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/fragments/RenderBlocksWrapper',
  () => () => <div />,
);

const mockStore = configureStore([]);

const item = {
  '@id': '/test-item',
  '@type': 'visualization',
  type_title: 'Chart (interactive)',
  title: 'Card title',
  Description: 'Card description',
  EffectiveDate: '2023-10-05T08:21:00+02:00',
  benchmark_level: ['1'],
};

const renderCard = (itemModel, props = {}, state = {}) => {
  const store = mockStore({
    screen: { width: 1024 },
    vocabularies: {},
    userSession: { token: null },
    ...state,
  });
  const result = render(
    <Provider store={store}>
      <MemoryRouter>
        <CardActionProvider
          item={item}
          itemModel={itemModel}
          isEditMode={props.isEditMode}
        >
          <CardTemplate item={item} itemModel={itemModel} {...props} />
        </CardActionProvider>
      </MemoryRouter>
    </Provider>,
  );
  return { ...result, store };
};

describe('CardTemplate', () => {
  it('renders the image on top by default', () => {
    const { container } = renderCard({
      hasDate: true,
      hasDescription: true,
      maxTitle: 2,
    });
    const card = container.querySelector('.ui.card.u-card');
    expect(card).toHaveClass('title-max-2-lines');
    expect(card).not.toHaveClass('item-card');
    expect(card.firstChild).toHaveClass('image');
    expect(card.querySelector('.meta .date')).toHaveTextContent('05 Oct 2023');
    expect(card.querySelector('.description')).toHaveTextContent(
      'Card description',
    );
  });

  it('renders the image on the left or right', () => {
    const { container: left } = renderCard({ imagePosition: 'left' });
    const leftCard = left.querySelector('.u-card');
    expect(leftCard).toHaveClass('item-card left-image-card');
    expect(leftCard.firstChild).toHaveClass('image');

    const { container: right } = renderCard({ imagePosition: 'right' });
    const rightCard = right.querySelector('.u-card');
    expect(rightCard).toHaveClass('item-card right-image-card');
    expect(rightCard.firstChild).toHaveClass('content');
    expect(rightCard.querySelector(':scope > .image')).not.toBeNull();
  });

  it('renders no image with imagePosition none', () => {
    const { container } = renderCard({ imagePosition: 'none' });
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders only the image in overlay mode', () => {
    const { container } = renderCard({
      contentMode: 'overlay',
      titleOnImage: true,
      hasDescription: true,
    });
    expect(container.querySelector('.content')).toBeNull();
    expect(container.querySelector('.gradient')).toHaveTextContent(
      'Card title',
    );
  });

  it('renders the visualization flavour through controls', () => {
    const { container, store } = renderCard(
      {
        imagePosition: 'bottom',
        hasBenchmarkLevel: true,
        hasDescription: true,
        hasDate: true,
        hasMetaType: true,
      },
      { preview_image_url: '/test-item/@@plotly_preview.svg/soer_miniature' },
    );
    const content = container.querySelector('.content');
    const children = Array.from(content.children).map((el) => el.className);
    // content type above the title, publishing date below it
    expect(children.slice(0, 4)).toEqual([
      'meta content-type',
      'header',
      'meta publishing-date',
      'benchmark_level_wrapper',
    ]);
    expect(content.querySelector('.content-type')).toHaveTextContent(
      'Chart (interactive)',
    );
    expect(content.querySelector('.publishing-date')).toHaveTextContent(
      '05 Oct 2023',
    );
    expect(content.lastChild).toHaveClass('image');
    expect(content.querySelector('img')).toHaveAttribute(
      'src',
      '/test-item/@@plotly_preview.svg/soer_miniature',
    );
    expect(
      container.querySelector('.benchmark_level[class~="1"]'),
    ).toBeInTheDocument();
    expect(store.getActions()[0]).toEqual(
      expect.objectContaining({
        vocabulary: 'collective.taxonomy.benchmark_level',
      }),
    );
  });

  it('does not load the benchmark vocabulary when disabled', () => {
    const { store, container } = renderCard({ hasBenchmarkLevel: false });
    expect(store.getActions()).toHaveLength(0);
    expect(container.querySelector('.benchmark_level_wrapper')).toBeNull();
  });

  it('does not reload a loaded benchmark vocabulary', () => {
    const { store, getByText } = renderCard(
      { hasBenchmarkLevel: true },
      {},
      {
        vocabularies: {
          'collective.taxonomy.benchmark_level': {
            loaded: true,
            items: [{ value: '1', label: 'Achieved' }],
          },
        },
      },
    );
    expect(store.getActions()).toHaveLength(0);
    expect(getByText('Achieved')).toBeInTheDocument();
  });

  it('links the title and the image to the same destination', () => {
    const { container } = renderCard({
      callToAction: { enable: true, urlTemplate: '$URL/details' },
    });
    const links = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual([
      '/test-item/details',
      '/test-item/details',
      '/test-item/details',
    ]);
  });

  it('does not link in edit mode', () => {
    const { container } = renderCard({}, { isEditMode: true });
    expect(container.querySelector('a')).toBeNull();
  });
});
