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

  it('does not link in edit mode', () => {
    const { container } = renderItem(
      { imagePosition: 'left' },
      { isEditMode: true },
    );
    expect(container.querySelector('a')).toBeNull();
  });
});
