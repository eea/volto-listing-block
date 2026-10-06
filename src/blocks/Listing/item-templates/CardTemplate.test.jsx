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

  it('renders the title and logo card as the former image on bottom card', () => {
    const { container } = renderCard({
      contentMode: 'logo',
      hasDate: true,
      hasDescription: true,
      callToAction: { enable: true, label: 'Read more' },
    });
    const card = container.querySelector('.u-card');
    expect(card).toHaveClass('image-on-bottom-card');
    // the styles target the direct children: content, image, footer
    expect(Array.from(card.children).map((el) => el.className)).toEqual([
      'content',
      'image',
      'extra content',
    ]);
    const content = card.querySelector(':scope > .content');
    expect(Array.from(content.children).map((el) => el.className)).toEqual([
      'header',
    ]);
    expect(card.querySelector('img')).toHaveAttribute('alt', 'Card title');
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

  it('renders the elements in the chosen order', () => {
    const { container } = renderCard({
      hasDescription: true,
      hasMetaType: true,
      hasBenchmarkLevel: true,
      elementsOrder: [
        'title',
        'description',
        'image',
        'benchmark',
        'date',
        'contentType',
      ],
    });
    const card = container.querySelector('.u-card');
    // the image is not first, so it goes inside the content
    expect(card.firstChild).toHaveClass('content');
    expect(
      Array.from(card.querySelector('.content').children).map(
        (el) => el.className,
      ),
    ).toEqual([
      'header',
      'description',
      'image',
      'benchmark_level_wrapper',
      'meta',
    ]);
  });

  it('keeps an image placed first outside the content', () => {
    const { container } = renderCard({
      elementsOrder: ['image', 'title', 'contentType', 'date'],
      hasMetaType: true,
    });
    const card = container.querySelector('.u-card');
    expect(card.firstChild).toHaveClass('image');
    const content = card.querySelector('.content');
    expect(content.firstChild).toHaveClass('header');
    // content type and date next to each other share one meta row
    expect(content.querySelectorAll('.meta')).toHaveLength(1);
    expect(content.querySelector('.meta .date')).toHaveTextContent(
      '05 Oct 2023',
    );
  });

  it('treats the image as first when the elements before it are hidden', () => {
    const { container } = renderCard({
      hasDescription: false,
      elementsOrder: ['description', 'image', 'title'],
    });
    expect(container.querySelector('.u-card').firstChild).toHaveClass('image');
  });

  it('renders tags and call to action in the footer by default', () => {
    const { container } = renderCard({
      hasTags: true,
      callToAction: { enable: true, label: 'Read more' },
    });
    const card = container.querySelector('.u-card');
    expect(card.lastChild).toHaveClass('extra');
    expect(card.lastChild).toHaveTextContent('Read more');
  });

  it('renders a call to action moved between the elements inline', () => {
    const { container } = renderCard({
      callToAction: { enable: true, label: 'Read more' },
      elementsOrder: ['image', 'cta', 'title'],
    });
    const content = container.querySelector('.u-card > .content');
    expect(content.firstChild).toHaveClass('card-inline-extra');
    expect(content.firstChild).toHaveTextContent('Read more');
    expect(container.querySelector('.content.extra')).toBeNull();
  });

  it('ignores the image in the order for side images', () => {
    const { container } = renderCard({
      imagePosition: 'right',
      elementsOrder: ['image', 'title'],
    });
    const card = container.querySelector('.u-card');
    expect(card.querySelector('.content .image')).toBeNull();
    expect(card.querySelector(':scope > .image')).not.toBeNull();
  });

  it('shows the content type and the head title (source) separately', () => {
    const { container } = renderCard(
      {
        imagePosition: 'top',
        hasMetaType: true,
        hasDate: true,
        elementsOrder: ['contentType', 'title', 'date', 'image'],
      },
      { head_title: 'Source: eea.europa.eu' },
    );
    const content = container.querySelector('.content');
    expect(content.querySelector('.content-type')).toHaveTextContent(
      'Chart (interactive)',
    );
    expect(content.lastChild).toHaveClass('card-source');
    expect(content.lastChild).toHaveTextContent('Source: eea.europa.eu');
  });

  it('keeps the head title in the metadata row of the default card', () => {
    const { container } = renderCard(
      { imagePosition: 'top', hasMetaType: true, hasDate: true },
      { head_title: 'Head title' },
    );
    expect(container.querySelector('.meta .text-left')).toHaveTextContent(
      'Head title',
    );
    expect(container.querySelector('.card-source')).toBeNull();
  });

  it('does not link in edit mode', () => {
    const { container } = renderCard({}, { isEditMode: true });
    expect(container.querySelector('a')).toBeNull();
  });
});
