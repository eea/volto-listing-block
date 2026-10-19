import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import { CardActionProvider } from '@eeacms/volto-listing-block/components/UniversalCard';
import ItemTemplate from './ItemTemplate';

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/fragments/RenderBlocksWrapper',
  () => () => <div />,
);

const mockStore = configureStore([]);

const item = {
  '@id': '/my-item',
  title: 'Item title',
  description: 'Item description',
  EffectiveDate: '2023-10-05T08:21:00+02:00',
  type_title: 'Page',
  meta: 'Search meta',
  extra: 'Extra content',
};

const renderItem = (itemModel, props = {}, itemProps = item) =>
  render(
    <Provider store={mockStore({ screen: { width: 1024 }, userSession: {} })}>
      <MemoryRouter>
        <CardActionProvider
          item={itemProps}
          itemModel={itemModel}
          isEditMode={props.isEditMode}
        >
          <ItemTemplate
            item={itemProps}
            itemModel={itemModel}
            className="my-class"
            {...props}
          />
        </CardActionProvider>
      </MemoryRouter>
    </Provider>,
  );

const getLinks = (container) =>
  Array.from(container.querySelectorAll('a')).map((a) =>
    a.getAttribute('href'),
  );

describe('ItemTemplate', () => {
  it.each(['left', 'right', 'none'])(
    'keeps a trailing CTA in the text column with image position %s',
    (imagePosition) => {
      const { container } = renderItem({
        imagePosition,
        callToAction: { enable: true, label: 'Read more', urlTemplate: '$URL' },
      });
      const cta = screen.getByText('Read more');
      expect(container.querySelector('.listing-body')).toContainElement(cta);
      expect(cta.closest('.card-inline-extra')).toBe(
        container.querySelector('.listing-body').lastChild,
      );
      expect(container.querySelector('.wrapper > .extra.content')).toBeNull();
    },
  );

  it('places the CTA before the title when reordered', () => {
    const { container } = renderItem({
      imagePosition: 'left',
      elementsOrder: [
        'cta',
        'title',
        'date',
        'description',
        'contentType',
        'tags',
      ],
      callToAction: { enable: true, label: 'Read more', urlTemplate: '$URL' },
    });
    expect(
      container.querySelector('.listing-body').firstChild,
    ).toContainElement(screen.getByText('Read more'));
  });
  it('moves metadata above the title while keeping the image on the side', () => {
    const { container } = renderItem({
      imagePosition: 'left',
      hasMetaType: true,
      hasDate: true,
      elementsOrder: [
        'contentType',
        'date',
        'title',
        'description',
        'tags',
        'cta',
      ],
    });
    expect(container.querySelector('.slot-top').firstChild).toHaveClass(
      'image-wrapper',
    );
    const body = container.querySelector('.listing-body');
    expect(body.firstChild).toHaveClass('item-meta');
    expect(body.children[1]).toHaveClass('listing-body-dates');
    expect(container.querySelectorAll('.item-meta')).toHaveLength(1);
  });

  it('reorders the metadata and title of compact items', () => {
    const { container } = renderItem({
      size: 'compact',
      imagePosition: 'none',
      hasMetaType: true,
      elementsOrder: ['contentType', 'title'],
    });
    expect(container.querySelector('.listing-body').firstChild).toHaveClass(
      'simple-item-meta',
    );
    expect(container.querySelectorAll('.simple-item-meta')).toHaveLength(1);
  });
  it('renders a default list item with image on the left', () => {
    const { container } = renderItem({
      imagePosition: 'left',
      hasDate: true,
      hasDescription: true,
    });
    expect(
      container.querySelector('.u-item.listing-item.my-class'),
    ).toBeInTheDocument();
    const slotTop = container.querySelector('.wrapper.left-image .slot-top');
    expect(slotTop.firstChild).toHaveClass('image-wrapper');
    expect(slotTop.lastChild).toHaveClass('listing-body');
    // the title and the image lead to the same destination
    expect(getLinks(container)).toEqual(['/my-item', '/my-item']);
    expect(screen.getByText('05 Oct 2023')).toHaveClass('listing-date');
    expect(screen.getByText('Item description')).toHaveClass(
      'listing-description',
    );
    expect(container.querySelector('.slot-bottom')).toHaveTextContent(
      'Extra content',
    );
  });

  it('renders the image on the right', () => {
    const { container } = renderItem({ imagePosition: 'right' });
    const slotTop = container.querySelector('.wrapper.right-image .slot-top');
    expect(slotTop.firstChild).toHaveClass('listing-body');
    expect(slotTop.lastChild).toHaveClass('image-wrapper');
  });

  it('displays the title on the side image', () => {
    const { container } = renderItem({
      imagePosition: 'left',
      titleOnImage: true,
    });
    const wrapper = container.querySelector('.image-wrapper.title-on-image');
    expect(wrapper.querySelector('.gradient .header')).toHaveTextContent(
      'Item title',
    );
    expect(container.querySelector('.listing-body .listing-header')).toBeNull();
  });

  it('keeps the title in the text without image', () => {
    const { container } = renderItem({
      imagePosition: 'none',
      titleOnImage: true,
    });
    expect(container.querySelector('.gradient')).toBeNull();
    expect(container.querySelector('.listing-header')).toBeInTheDocument();
  });

  it('renders without image', () => {
    const { container } = renderItem({ imagePosition: 'none' });
    expect(container.querySelector('.image-wrapper')).toBeNull();
  });

  it('renders the search result flavour with hasHeadMeta', () => {
    const { container } = renderItem({
      imagePosition: 'right',
      hasHeadMeta: true,
      hasDescription: true,
    });
    const root = container.querySelector('.u-item');
    expect(root).toHaveClass('result-item');
    expect(root.querySelector('.slot-head')).toHaveTextContent('Search meta');
    expect(root.querySelector('.listing-body .slot-bottom')).toHaveTextContent(
      'Extra content',
    );
  });

  it('does not nest links in titles that already are links', () => {
    const { container } = renderItem(
      { imagePosition: 'none', hasHeadMeta: true },
      {},
      { ...item, title: <a href="/search-result">Result</a> },
    );
    expect(getLinks(container)).toEqual(['/search-result']);
  });

  it('renders the compact flavour', () => {
    const { container } = renderItem({
      imagePosition: 'none',
      size: 'compact',
      hasMetaType: true,
    });
    const root = container.querySelector('.u-item');
    expect(root).toHaveClass('simple-listing-item');
    expect(root.querySelector('p.listing-header')).toHaveTextContent(
      'Item title',
    );
    expect(root.querySelector('.simple-item-meta')).toHaveTextContent('Page');
    expect(root.querySelector('.slot-bottom')).toBeNull();
  });

  it('renders the icon', () => {
    const { container } = renderItem({
      imagePosition: 'none',
      hasIcon: true,
      icon: 'ri-home-line',
    });
    expect(container.querySelector('.listing-body.has-icon')).not.toBeNull();
    expect(container.querySelector('i.ri-home-line')).not.toBeNull();
  });

  it('renders list elements in the stored order', () => {
    const { container } = renderItem({
      imagePosition: 'none',
      hasDate: true,
      hasDescription: true,
      hasMetaType: true,
      elementsOrder: ['description', 'contentType', 'title', 'date'],
    });
    const body = container.querySelector('.listing-body');
    expect(Array.from(body.children).map((el) => el.className)).toEqual([
      'listing-description',
      'item-meta',
      '',
      'listing-body-dates',
    ]);
    expect(container.querySelector('.slot-top + .item-meta')).toBeNull();
  });

  it.each(['left', 'right', 'none'])(
    'keeps content type in the text column with image position %s',
    (imagePosition) => {
      const { container } = renderItem({
        imagePosition,
        hasMetaType: true,
      });
      expect(
        container.querySelector('.listing-body .item-meta'),
      ).toHaveTextContent('Page');
      expect(container.querySelector('.slot-top + .item-meta')).toBeNull();
    },
  );

  it('keeps the empty dates container of the former list item', () => {
    const { container } = renderItem({ imagePosition: 'none', hasDate: false });
    // it gives the spacing below the title, as before
    expect(
      container.querySelector('.listing-body-dates'),
    ).toBeEmptyDOMElement();
  });

  it('renders the compact item as the former simple item', () => {
    const { container } = renderItem({
      imagePosition: 'none',
      size: 'compact',
    });
    const wrapper = container.querySelector('.wrapper');
    expect(wrapper.className).toBe('wrapper');
    // the whole body is the link
    expect(
      container.querySelector('.slot-top > a > .listing-body'),
    ).not.toBeNull();
    expect(container.querySelector('.listing-body-dates')).toBeNull();
    expect(
      container.querySelector('.slot-top + .simple-item-meta'),
    ).toBeEmptyDOMElement();
  });

  it('does not link in edit mode', () => {
    const { container } = renderItem(
      { imagePosition: 'left' },
      { isEditMode: true },
    );
    expect(container.querySelector('a')).toBeNull();
  });
});
