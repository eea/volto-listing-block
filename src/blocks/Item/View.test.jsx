import React from 'react';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import ViewItemBlock from './View';

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
  },
};

describe('ViewItemBlock', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Provider store={store}>
        <ViewItemBlock data={mockData} />
      </Provider>,
    );

    expect(
      container.querySelector('.ui.unstackable.items.row'),
    ).toBeInTheDocument();
    expect(container.querySelector('div.item')).toBeInTheDocument();
    expect(container.querySelector('div.content')).toBeInTheDocument();
  });
});
