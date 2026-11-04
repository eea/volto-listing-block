import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import withItemModelMigration from './withItemModelMigration';
import { useHasCharts } from './ChartPreviewContext';

const mockStore = configureStore([]);

const Edit = () => <div>{useHasCharts() ? 'charts' : 'edit'}</div>;
const WrappedEdit = withItemModelMigration(Edit);

const withStore = (element, state = {}) => (
  <Provider
    store={mockStore({ querystringsearch: { subrequests: {} }, ...state })}
  >
    {element}
  </Provider>
);

describe('withItemModelMigration', () => {
  it('migrates a legacy itemModel once the block is selected', () => {
    const onChangeBlock = jest.fn();
    const data = { '@type': 'listing', itemModel: { '@type': 'imageOnLeft' } };

    const { rerender } = render(
      withStore(
        <WrappedEdit
          data={data}
          block="b1"
          selected={false}
          onChangeBlock={onChangeBlock}
        />,
      ),
    );
    expect(onChangeBlock).not.toHaveBeenCalled();

    rerender(
      withStore(
        <WrappedEdit
          data={data}
          block="b1"
          selected={true}
          onChangeBlock={onChangeBlock}
        />,
      ),
    );
    expect(onChangeBlock).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({
        '@type': 'listing',
        itemModel: expect.objectContaining({
          '@type': 'card',
          imagePosition: 'left',
        }),
      }),
    );
  });

  it('does nothing for current data', () => {
    const onChangeBlock = jest.fn();
    render(
      withStore(
        <WrappedEdit
          data={{ itemModel: { '@type': 'card', imagePosition: 'top' } }}
          block="b1"
          selected={true}
          onChangeBlock={onChangeBlock}
        />,
      ),
    );
    expect(onChangeBlock).not.toHaveBeenCalled();
  });

  it('tells the sidebar when the results have interactive charts', () => {
    const results = (items) => ({
      querystringsearch: { subrequests: { b1: { items } } },
    });
    const { getByText, rerender } = render(
      withStore(
        <WrappedEdit data={{}} block="b1" />,
        results([{ '@id': '/news', '@type': 'News Item' }]),
      ),
    );
    expect(getByText('edit')).toBeInTheDocument();
    rerender(
      withStore(
        <WrappedEdit data={{}} block="b1" />,
        results([{ '@id': '/chart', '@type': 'visualization' }]),
      ),
    );
    expect(getByText('charts')).toBeInTheDocument();
  });

  it('tells the sidebar when the teaser shows an interactive chart', () => {
    const { getByText } = render(
      withStore(
        <WrappedEdit
          data={{ href: [{ '@id': '/chart', '@type': 'visualization' }] }}
          block="t1"
        />,
      ),
    );
    expect(getByText('charts')).toBeInTheDocument();
  });

  it('does not wrap twice', () => {
    expect(withItemModelMigration(WrappedEdit)).toBe(WrappedEdit);
  });
});
