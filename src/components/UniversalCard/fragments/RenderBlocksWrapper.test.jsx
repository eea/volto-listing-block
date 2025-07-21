import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RenderBlocksWrapper from './RenderBlocksWrapper';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore([]);

jest.mock('@plone/volto/components', () => ({
  RenderBlocks: jest.fn(() => <div data-testid="render-blocks" />),
}));

jest.mock('@plone/volto/actions', () => ({
  getContent: jest.fn(() => ({
    type: 'GET_CONTENT',
    finally: jest.fn((cb) => cb()),
  })),
}));

jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: jest.fn((url) => url),
}));

jest.mock('@plone/volto/registry', () => ({
  settings: {
    apiExpanders: [],
  },
}));

describe('RenderBlocksWrapper', () => {
  let store;

  const mockLocation = {
    pathname: '/test-path',
  };

  it('should dispatch getContent and show loading when content is not in store and not loading (apiExpanders undefined)', () => {
    // Temporarily set apiExpanders to undefined for this test case
    const originalApiExpandersConfig = require('@plone/volto/registry').settings
      .apiExpanders;
    require('@plone/volto/registry').settings.apiExpanders = undefined;

    store = mockStore({
      content: {
        subrequests: {},
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <RenderBlocksWrapper location={mockLocation} />
      </Provider>,
    );

    expect(getByText('Loading...')).toBeInTheDocument();
    expect(require('@plone/volto/actions').getContent).toHaveBeenCalledWith(
      '/test-path',
      null,
      '/test-path',
    );

    // Restore the original mock for apiExpanders to avoid affecting other tests
    require('@plone/volto/registry').settings.apiExpanders =
      originalApiExpandersConfig;
  });

  it('should show loading when content is loading', () => {
    store = mockStore({
      content: {
        subrequests: {
          [mockLocation.pathname]: {
            loading: true,
          },
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <RenderBlocksWrapper location={mockLocation} />
      </Provider>,
    );

    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should render content when content is in store', () => {
    const mockContent = {
      title: 'Test Title',
      '@id': '/test-path',
    };
    store = mockStore({
      content: {
        subrequests: {
          [mockLocation.pathname]: {
            data: mockContent,
            loading: false,
          },
        },
      },
    });

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <RenderBlocksWrapper location={mockLocation} />
      </Provider>,
    );

    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByTestId('render-blocks')).toBeInTheDocument();
    expect(
      require('@plone/volto/components').RenderBlocks,
    ).toHaveBeenCalledWith(
      {
        content: mockContent,
        location: { pathname: '/test-path' },
      },
      {},
    );
  });

  it('should restore apiExpanders after getContent is dispatched', async () => {
    const originalApiExpanders = [{ an: 'expander' }];
    require('@plone/volto/registry').settings.apiExpanders = [
      ...originalApiExpanders,
    ];

    const getContentMock = jest.fn(() => ({
      type: 'GET_CONTENT_SUCCESS',
      finally: jest.fn((cb) => cb()),
    }));
    require('@plone/volto/actions').getContent = getContentMock;

    store = mockStore({
      content: {
        subrequests: {},
      },
    });

    render(
      <Provider store={store}>
        <RenderBlocksWrapper location={mockLocation} />
      </Provider>,
    );

    await Promise.resolve();

    expect(getContentMock).toHaveBeenCalledTimes(1);
    expect(require('@plone/volto/registry').settings.apiExpanders).toEqual(
      originalApiExpanders,
    );

    // Clean up mock for other tests
    require('@plone/volto/actions').getContent = jest.fn(() => ({
      type: 'GET_CONTENT',
    }));
    require('@plone/volto/registry').settings.apiExpanders = [];
  });
});
