import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import withItemModelMigration from './withItemModelMigration';

const Edit = () => <div>edit</div>;
const WrappedEdit = withItemModelMigration(Edit);

describe('withItemModelMigration', () => {
  it('migrates a legacy itemModel once the block is selected', () => {
    const onChangeBlock = jest.fn();
    const data = { '@type': 'listing', itemModel: { '@type': 'imageOnLeft' } };

    const { rerender } = render(
      <WrappedEdit
        data={data}
        block="b1"
        selected={false}
        onChangeBlock={onChangeBlock}
      />,
    );
    expect(onChangeBlock).not.toHaveBeenCalled();

    rerender(
      <WrappedEdit
        data={data}
        block="b1"
        selected={true}
        onChangeBlock={onChangeBlock}
      />,
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
      <WrappedEdit
        data={{ itemModel: { '@type': 'card', imagePosition: 'top' } }}
        block="b1"
        selected={true}
        onChangeBlock={onChangeBlock}
      />,
    );
    expect(onChangeBlock).not.toHaveBeenCalled();
  });

  it('does not wrap twice', () => {
    expect(withItemModelMigration(WrappedEdit)).toBe(WrappedEdit);
  });
});
