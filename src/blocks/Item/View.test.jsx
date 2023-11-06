import React from 'react';
import { Provider } from 'react-intl-redux';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
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
    const component = renderer.create(
      <Provider store={store}>
        <ViewItemBlock data={mockData} />
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
