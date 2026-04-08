import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RenderBlocksWrapper from './RenderBlocksWrapper';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import { getContent } from '@plone/volto/actions/content/content';
import config from '@plone/volto/registry';
import '@testing-library/jest-dom';

const mockStore = configureStore([]);

jest.mock('@plone/volto/components/theme/View/RenderBlocks', () =>
  jest.fn(() => <div data-testid="render-blocks" />),
);

jest.mock('@plone/volto/actions/content/content', () => ({
  getContent: jest.fn(() => ({
    type: 'GET_CONTENT',
  })),
}));

jest.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: jest.fn((url) => url),
}));

jest.mock('@plone/volto/registry', () => {
  const settings = {
    apiExpanders: [],
  };
  return {
    __esModule: true,
    default: { settings },
    settings,
  };
});

describe('RenderBlocksWrapper', () => {
  let store;

  const mockLocation = {
    pathname: '/test-path',
  };

  it('should dispatch getContent and show loading when content is not in store and not loading (apiExpanders undefined)', () => {
    // Temporarily set apiExpanders to undefined for this test case
    const originalApiExpandersConfig = config.settings.apiExpanders;
    config.settings.apiExpanders = undefined;

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
    expect(getContent).toHaveBeenCalledWith('/test-path', null, '/test-path');

    // Restore the original mock for apiExpanders to avoid affecting other tests
    config.settings.apiExpanders = originalApiExpandersConfig;
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
    expect(RenderBlocks).toHaveBeenCalledWith(
      {
        content: mockContent,
        location: { pathname: '/test-path' },
      },
      {},
    );
  });

  it('should restore apiExpanders after getContent is dispatched', async () => {
    const originalApiExpanders = [{ an: 'expander' }];
    config.settings.apiExpanders = [...originalApiExpanders];

    const getContentMock = jest.fn(() => ({
      type: 'GET_CONTENT_SUCCESS',
    }));
    getContent.mockImplementation(getContentMock);

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
    expect(config.settings.apiExpanders).toEqual(originalApiExpanders);

    // Clean up mock for other tests
    getContent.mockImplementation(() => ({ type: 'GET_CONTENT' }));
    config.settings.apiExpanders = [];
  });
});
