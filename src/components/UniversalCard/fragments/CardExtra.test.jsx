import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import CardExtra from './CardExtra';

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      publicURL: 'https://example.com',
      apiPath: 'https://example.com',
      hashLinkSmoothScroll: false,
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

jest.mock('./RenderBlocksWrapper', () =>
  jest.fn(() => <div data-testid="render-blocks-wrapper" />),
);

const mockStore = configureStore([]);

const item = { '@id': '/test-item', Subject: ['Tag1', 'Tag2'] };

const renderExtra = (props) =>
  render(
    <Provider
      store={mockStore({
        screen: { width: 1024 },
        userSession: { token: null },
      })}
    >
      <MemoryRouter>
        <CardExtra item={item} {...props} />
      </MemoryRouter>
    </Provider>,
  );

const cta = (options = {}, itemModel = {}) => ({
  ...itemModel,
  callToAction: { enable: true, ...options },
});

describe('CardExtra', () => {
  it('renders nothing without tags and call to action', () => {
    const { container } = renderExtra({ itemModel: {} });
    expect(container.firstChild).toBeNull();
  });

  it('renders the tags', () => {
    renderExtra({ itemModel: { hasTags: true } });
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  it('does not render tags when the item has none', () => {
    const { container } = renderExtra({
      item: { '@id': '/x' },
      itemModel: { hasTags: true },
    });
    expect(container.querySelector('.tags.labels')).toBeNull();
  });

  it('renders the call to action with its label', () => {
    renderExtra({ itemModel: cta({ label: 'Click Me' }) });
    expect(screen.getByText('Click Me').tagName).toBe('A');
  });

  it('uses "Read more" as default label', () => {
    renderExtra({ itemModel: cta() });
    expect(screen.getByText('Read more')).toBeInTheDocument();
  });

  it('uses the url template', () => {
    renderExtra({ itemModel: cta({ urlTemplate: '$URL/details' }) });
    expect(screen.getByText('Read more')).toHaveAttribute(
      'href',
      '/test-item/details',
    );
  });

  it('uses the action link when there is no url template', () => {
    renderExtra({ itemModel: cta({ href: [{ '@id': '/custom-link' }] }) });
    expect(screen.getByText('Read more')).toHaveAttribute(
      'href',
      '/custom-link',
    );
  });

  it('falls back to the item url', () => {
    renderExtra({ itemModel: cta() });
    expect(screen.getByText('Read more')).toHaveAttribute('href', '/test-item');
  });

  it('renders a button without link in edit mode', () => {
    renderExtra({ itemModel: cta(), isEditMode: true });
    const button = screen.getByText('Read more');
    expect(button.tagName).toBe('BUTTON');
    expect(button).not.toHaveAttribute('href');
  });

  it('applies the theme classes', () => {
    renderExtra({
      itemModel: cta({}, { styles: { 'theme:noprefix': 'primary' } }),
    });
    expect(screen.getByText('Read more').className).toContain('primary');
  });

  it('applies the inverted theme classes', () => {
    renderExtra({
      itemModel: cta(
        {},
        { styles: { 'theme:noprefix': 'primary', 'inverted:bool': true } },
      ),
    });
    expect(screen.getByText('Read more').className).toContain(
      'primary inverted',
    );
  });

  it('uses basic black when inverted without theme', () => {
    renderExtra({ itemModel: cta({}, { styles: { 'inverted:bool': true } }) });
    expect(screen.getByText('Read more').className).toContain('basic black');
  });
});
