import React from 'react';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import ViewItemBlock, { serializeText } from './View';
import { serializeNodes } from '@plone/volto-slate/editor/render';
jest.mock('@plone/volto-slate/editor/render', () => ({
  serializeNodes: jest.fn(),
}));

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

const mockData = {
  data: {
    id: 'test',
    placeholder: 'placeholder',
    description: [{ type: 'paragraph', children: [{ text: 'foo' }] }],
  },
};

describe('ViewItemBlock', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Provider store={store}>
        <ViewItemBlock data={mockData.data} />
      </Provider>,
    );

    expect(
      container.querySelector('.ui.unstackable.items.row'),
    ).toBeInTheDocument();
    expect(container.querySelector('div.item')).toBeInTheDocument();
    expect(container.querySelector('div.content')).toBeInTheDocument();
  });
});

describe('serializeText', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the text when it is not an array', () => {
    const text = 'Hello, World!';

    expect(serializeText(text)).toEqual(text);
    expect(serializeNodes).not.toHaveBeenCalled();
  });

  it('should call serializeNodes when text is an array', () => {
    const text = ['Hello', 'World!'];

    serializeText(text);
    expect(serializeNodes).toHaveBeenCalledWith(text);
  });
});
