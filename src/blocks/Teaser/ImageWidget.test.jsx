import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import ImageWidget from './ImageWidget';

jest.mock('@plone/volto/helpers/Url/Url', () => {
  return {
    flattenToAppURL: jest.fn(),
    getBaseUrl: jest.fn(),
    isInternalURL: jest.fn(),
  };
});

jest.mock('react-dropzone', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return children({
        getRootProps: () => {},
        getInputProps: () => {},
      });
    },
  };
});
const mockStore = configureStore([]);

describe('ImageWidget', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      intl: {
        locale: 'en',
      },
      content: { subrequests: {} },
    });
  });

  it('renders without image', async () => {
    const { findByPlaceholderText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ImageWidget
            id="test"
            onChange={jest.fn()}
            value={null}
            inline={false}
          />
        </BrowserRouter>
      </Provider>,
    );

    const input = await findByPlaceholderText(
      'Browse the site, drop an image, or type an URL',
    );
    expect(input).toBeInTheDocument();
  });

  it('handles image upload', async () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const { findByPlaceholderText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ImageWidget
            id="test"
            onChange={jest.fn()}
            value={null}
            inline={false}
          />
        </BrowserRouter>
      </Provider>,
    );
    const input = await findByPlaceholderText(
      'Browse the site, drop an image, or type an URL',
    );
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [file] } });
  });

  it('handles image deletion', () => {
    const { getByLabelText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ImageWidget id="test" onChange={jest.fn()} value="test_image" />
        </BrowserRouter>
      </Provider>,
    );
    const button = getByLabelText('Remove image');
    fireEvent.click(button);
  });

  it('handles URL submission', async () => {
    const onChange = jest.fn();
    const { findByPlaceholderText, container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ImageWidget id="test" onChange={onChange} />
        </BrowserRouter>
      </Provider>,
    );
    const input = await findByPlaceholderText(
      'Browse the site, drop an image, or type an URL',
    );
    fireEvent.change(input, { target: { value: 'https://test.com' } });
    const button = container.querySelector('.ui.basic.primary.button');
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith('test', 'https://test.com');
  });
});
