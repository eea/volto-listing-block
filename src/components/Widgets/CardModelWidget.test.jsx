import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardModelWidget from './CardModelWidget';

jest.mock('@plone/volto/components/manage/Form', () => ({
  Field: ({ id, title, value, onChange, onChangeObject }) => (
    <div>
      <span data-testid={`value-${title}`}>{String(value)}</span>
      <button onClick={() => onChange(id, 'changed')}>change {title}</button>
      <button onClick={() => onChangeObject({ hasDate: false, maxTitle: 3 })}>
        patch {title}
      </button>
    </div>
  ),
}));

const schema = {
  fieldsets: [{ id: 'default', title: 'Default', fields: ['a', 'b'] }],
  properties: { a: { title: 'A' }, b: { title: 'B' } },
  required: [],
};

describe('CardModelWidget', () => {
  it('renders the fields with their values', () => {
    render(
      <CardModelWidget
        id="itemModel"
        schema={schema}
        value={{ a: 1, b: 2 }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId('value-A')).toHaveTextContent('1');
    expect(screen.getByTestId('value-B')).toHaveTextContent('2');
  });

  it('updates the own field of a field', () => {
    const onChange = jest.fn();
    render(
      <CardModelWidget
        id="itemModel"
        schema={schema}
        value={{ a: 1, b: 2 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('change A'));
    expect(onChange).toHaveBeenCalledWith('itemModel', { a: 'changed', b: 2 });
  });

  it('lets a field update sibling fields', () => {
    const onChange = jest.fn();
    render(
      <CardModelWidget
        id="itemModel"
        schema={schema}
        value={{ a: 1, b: 2 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('patch A'));
    expect(onChange).toHaveBeenCalledWith('itemModel', {
      a: 1,
      b: 2,
      hasDate: false,
      maxTitle: 3,
    });
  });

  it('renders tabs for several fieldsets', () => {
    render(
      <CardModelWidget
        id="itemModel"
        schema={{
          ...schema,
          fieldsets: [
            ...schema.fieldsets,
            { id: 'styling', title: 'Styling', fields: [] },
          ],
        }}
        value={{}}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText('Styling')).toBeInTheDocument();
  });
});
