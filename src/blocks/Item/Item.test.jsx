import React from 'react';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import * as voltoRegistry from '@plone/volto/registry';
import * as voltoHelpers from '@plone/volto/helpers/Url/Url';
import * as objectWidgetHelpers from '@eeacms/volto-object-widget/helpers';
import Item, { getItemIconPrefix } from './Item';

describe('getItemIconPrefix', () => {
  const OLD_CONFIG = { ...voltoRegistry.default };
  afterEach(() => {
    voltoRegistry.default.blocks = OLD_CONFIG.blocks;
  });

  it('returns icon with prefix if not present', () => {
    voltoRegistry.default.blocks = {
      blocksConfig: { item: { iconPrefix: 'ri-' } },
    };
    expect(getItemIconPrefix('user')).toBe('ri-user');
  });

  it('returns icon unchanged if prefix already present', () => {
    voltoRegistry.default.blocks = {
      blocksConfig: { item: { iconPrefix: 'ri-' } },
    };
    expect(getItemIconPrefix('ri-user')).toBe('ri-user');
  });

  it('returns icon unchanged if no prefix configured', () => {
    voltoRegistry.default.blocks = { blocksConfig: { item: {} } };
    expect(getItemIconPrefix('user')).toBe('user');
  });
});

describe('ItemImage (via Item)', () => {
  beforeAll(() => {
    jest.spyOn(voltoHelpers, 'getFieldURL').mockImplementation((img) => img);
    jest
      .spyOn(objectWidgetHelpers, 'getImageScaleParams')
      .mockImplementation((url, size) => ({
        download: `${url}/@@images/image/${size}`,
      }));
    voltoRegistry.default.blocks = {
      blocksConfig: {
        item: {
          imageSizes: {
            large: { width: 800, height: 600 },
            small: { width: 200, height: 150 },
          },
        },
      },
    };
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders image with correct src, width, and height', () => {
    const mockDataWithImage = {
      data: { id: 'test-image', placeholder: 'placeholder' },
      assetType: 'image',
      image: '/path/to/image.jpg',
      imageSize: 'large',
      verticalAlign: 'middle',
      header: 'Image Item',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataWithImage} />
      </Provider>,
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      '/path/to/image.jpg/@@images/image/large',
    );
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
    expect(img).toHaveClass('ui', 'large', 'middle', 'aligned');
  });

  it('returns null if getFieldURL returns null', () => {
    voltoHelpers.getFieldURL.mockReturnValueOnce(null);
    const mockDataWithImage = {
      data: { id: 'test-image', placeholder: 'placeholder' },
      assetType: 'image',
      image: null,
      imageSize: 'large',
      verticalAlign: 'middle',
      header: 'Image Item',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataWithImage} />
      </Provider>,
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });
}); // Import the Item component
const mockStore = configureStore();

const store = mockStore({
  content: {
    data: {
      id: 'test',
      placeholder: 'placeholder',
    },
  },
  intl: {
    locale: 'en',
    messages: {},
  },
});

describe('Item', () => {
  it('renders image asset type', () => {
    const mockDataWithImage = {
      data: {
        id: 'test-image',
        placeholder: 'placeholder',
      },
      assetType: 'image',
      image: '/path/to/image.jpg',
      imageSize: 'large',
      verticalAlign: 'middle',
      header: 'Image Item',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataWithImage} />
      </Provider>,
    );

    const imageWrapperElement = container.querySelector('.item');
    expect(imageWrapperElement).toBeInTheDocument();

    const imgElement = imageWrapperElement.querySelector('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute(
      'src',
      '/path/to/image.jpg/@@images/image/large',
    );
  });

  it('renders icon asset type', () => {
    const mockDataWithIcon = {
      data: {
        id: 'test-icon',
        placeholder: 'placeholder',
      },
      assetType: 'icon',
      icon: 'users',
      iconSize: 'massive',
      theme: 'red',
      verticalAlign: 'top',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataWithIcon} />
      </Provider>,
    );

    const iconElement = container.querySelector('.icon');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass(
      'users',
      'red',
      'top',
      'aligned',
      'massive',
    );
    expect(iconElement).not.toHaveClass('medium');
  });

  it('renders children in edit mode', () => {
    const mockDataEditMode = {
      data: {
        id: 'test-edit',
        placeholder: 'placeholder',
      },
      mode: 'edit',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataEditMode}>
          <div className="edit-mode-children">Edit Mode Content</div>
        </Item>
      </Provider>,
    );

    expect(container.querySelector('.edit-mode-children')).toBeInTheDocument();
    expect(container.querySelector('.edit-mode-children')).toHaveTextContent(
      'Edit Mode Content',
    );
  });

  it('renders header, meta, description (view mode), and extra', () => {
    const mockDataFull = {
      data: {
        id: 'test-full',
        placeholder: 'placeholder',
      },
      header: 'Full Header',
      meta: 'Full Meta',
      description: 'Full Description',
      extra: 'Full Extra',
      mode: 'view',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataFull} />
      </Provider>,
    );

    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.header')).toHaveTextContent('Full Header');
    expect(container.querySelector('.meta')).toBeInTheDocument();
    expect(container.querySelector('.meta')).toHaveTextContent('Full Meta');
    expect(container.querySelector('.description')).toBeInTheDocument();
    expect(container.querySelector('.description')).toHaveTextContent(
      'Full Description',
    );
    expect(container.querySelector('.extra')).toBeInTheDocument();
    expect(container.querySelector('.extra')).toHaveTextContent('Full Extra');
  });

  it('renders header only', () => {
    const mockDataHeaderOnly = {
      data: {
        id: 'test-header',
        placeholder: 'placeholder',
      },
      header: 'Header Only',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataHeaderOnly} />
      </Provider>,
    );

    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.header')).toHaveTextContent('Header Only');
    expect(container.querySelector('.meta')).not.toBeInTheDocument();
    expect(container.querySelector('.description')).not.toBeInTheDocument();
    expect(container.querySelector('.extra')).not.toBeInTheDocument();
  });

  it('renders meta only', () => {
    const mockDataMetaOnly = {
      data: {
        id: 'test-meta',
        placeholder: 'placeholder',
      },
      meta: 'Meta Only',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataMetaOnly} />
      </Provider>,
    );

    expect(container.querySelector('.meta')).toBeInTheDocument();
    expect(container.querySelector('.meta')).toHaveTextContent('Meta Only');
    expect(container.querySelector('.header')).not.toBeInTheDocument();
    expect(container.querySelector('.description')).not.toBeInTheDocument();
    expect(container.querySelector('.extra')).not.toBeInTheDocument();
  });

  it('renders description only (view mode)', () => {
    const mockDataDescriptionOnly = {
      data: {
        id: 'test-description',
        placeholder: 'placeholder',
      },
      description: 'Description Only',
      mode: 'view',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataDescriptionOnly} />
      </Provider>,
    );

    expect(container.querySelector('.description')).toBeInTheDocument();
    expect(container.querySelector('.description')).toHaveTextContent(
      'Description Only',
    );
    expect(container.querySelector('.header')).not.toBeInTheDocument();
    expect(container.querySelector('.meta')).not.toBeInTheDocument();
    expect(container.querySelector('.extra')).not.toBeInTheDocument();
  });

  it('renders extra only', () => {
    const mockDataExtraOnly = {
      data: {
        id: 'test-extra',
        placeholder: 'placeholder',
      },
      extra: 'Extra Only',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataExtraOnly} />
      </Provider>,
    );

    expect(container.querySelector('.extra')).toBeInTheDocument();
    expect(container.querySelector('.extra')).toHaveTextContent('Extra Only');
    expect(container.querySelector('.header')).not.toBeInTheDocument();
    expect(container.querySelector('.meta')).not.toBeInTheDocument();
    expect(container.querySelector('.description')).not.toBeInTheDocument();
  });

  it('renders icon with medium size', () => {
    const mockDataIconMedium = {
      data: {
        id: 'test-icon-medium',
        placeholder: 'placeholder',
      },
      assetType: 'icon',
      icon: 'settings',
      iconSize: 'medium',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataIconMedium} />
      </Provider>,
    );

    const iconElement = container.querySelector('.icon');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass('settings', 'medium');
    expect(iconElement).not.toHaveClass('big', 'large', 'massive');
  });

  it('renders icon with big size', () => {
    const mockDataIconBig = {
      data: {
        id: 'test-icon-big',
        placeholder: 'placeholder',
      },
      assetType: 'icon',
      icon: 'camera',
      iconSize: 'big',
    };
    const { container } = render(
      <Provider store={store}>
        <Item {...mockDataIconBig} />
      </Provider>,
    );

    const iconElement = container.querySelector('.icon');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass('camera', 'big');
    expect(iconElement).not.toHaveClass('medium', 'large', 'massive');
  });
  // End of tests for ItemImage and getItemIconPrefix
});
