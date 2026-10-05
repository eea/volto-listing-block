import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import '@testing-library/jest-dom';
import CardElementsWidget, { isElementVisible } from './CardElementsWidget';

// render the list without the drag and drop library
jest.mock(
  '@plone/volto/components/manage/DragDropList/DragDropList',
  () =>
    ({ childList, children }) =>
      childList.map(([childId, child], index) =>
        children({
          child,
          childId,
          index,
          draginfo: {
            innerRef: () => {},
            draggableProps: {},
            dragHandleProps: {},
          },
        }),
      ),
);

jest.mock(
  '@plone/volto/components/manage/Widgets/FormFieldWrapper',
  () =>
    ({ title, children }) => (
      <div>
        <label>{title}</label>
        {children}
      </div>
    ),
);

// a minimal Field: an input showing its value
jest.mock('@plone/volto/components/manage/Form', () => ({
  Field: ({ id, title, value, onChange }) => (
    <label>
      {title}
      <input
        data-testid={id}
        value={value ?? ''}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </label>
  ),
}));

const elements = [
  ['image', 'Image'],
  ['title', 'Title'],
  ['date', 'Publication date'],
];

const elementSettings = {
  image: { toggle: { field: 'imagePosition', on: 'top', off: 'none' } },
  title: { fields: ['maxTitle'] },
  date: {
    toggle: { field: 'hasDate', on: true, off: false, defaultVisible: true },
    fields: ['hasEventDate'],
  },
};

const fieldSchemas = {
  maxTitle: { title: 'Title max lines', type: 'number' },
  hasEventDate: { title: 'Event date', type: 'boolean' },
};

const renderWidget = (props = {}) => {
  const onChange = jest.fn();
  const onChangeObject = jest.fn();
  render(
    <IntlProvider locale="en">
      <CardElementsWidget
        id="elementsOrder"
        title="Card elements"
        elements={elements}
        elementSettings={elementSettings}
        fieldSchemas={fieldSchemas}
        objectvalue={{ imagePosition: 'top', maxTitle: 2 }}
        onChange={onChange}
        onChangeObject={onChangeObject}
        {...props}
      />
    </IntlProvider>,
  );
  return { onChange, onChangeObject };
};

describe('CardElementsWidget', () => {
  it('lists the elements in order', () => {
    renderWidget();
    expect(
      Array.from(document.querySelectorAll('.card-element-label')).map(
        (el) => el.textContent,
      ),
    ).toEqual(['Image', 'Title', 'Publication date']);
  });

  it('reorders with the arrows', () => {
    const { onChange } = renderWidget();
    fireEvent.click(screen.getByLabelText('Move Image down'));
    expect(onChange).toHaveBeenCalledWith('elementsOrder', [
      'title',
      'image',
      'date',
    ]);
    expect(screen.getByLabelText('Move Image up')).toBeDisabled();
  });

  it('switches an element off by updating its field', () => {
    const { onChangeObject } = renderWidget();
    fireEvent.click(screen.getByLabelText('Show Image'));
    expect(onChangeObject).toHaveBeenCalledWith({ imagePosition: 'none' });
  });

  it('switches an element on', () => {
    const { onChangeObject } = renderWidget({
      objectvalue: { hasDate: false },
    });
    expect(document.querySelectorAll('.card-element')[2]).toHaveClass(
      'card-element--off',
    );
    fireEvent.click(screen.getByLabelText('Show Publication date'));
    expect(onChangeObject).toHaveBeenCalledWith({ hasDate: true });
  });

  it('has no toggle for elements that are always shown', () => {
    renderWidget();
    expect(screen.queryByLabelText('Show Title')).toBeNull();
  });

  it('expands an element to edit its settings', () => {
    const { onChangeObject } = renderWidget();
    expect(screen.queryByText('Title max lines')).toBeNull();
    fireEvent.click(screen.getByLabelText('Title settings'));
    const input = screen.getByTestId('elementsOrder-title-maxTitle');
    expect(input).toHaveValue('2');
    fireEvent.change(input, { target: { value: '3' } });
    expect(onChangeObject).toHaveBeenCalledWith({ maxTitle: '3' });
  });

  it('does not expand elements without settings', () => {
    renderWidget();
    expect(screen.getByText('Image').closest('button')).toBeDisabled();
  });
});

describe('CardElementsWidget nested settings', () => {
  it('switches the call to action on inside its object', () => {
    const { onChangeObject } = renderWidget({
      elements: [['cta', 'Call to action']],
      elementSettings: {
        cta: {
          toggle: {
            field: 'callToAction',
            key: 'enable',
            on: true,
            off: false,
          },
          fields: [{ field: 'callToAction', key: 'label' }],
        },
      },
      fieldSchemas: { 'callToAction.label': { title: 'Action label' } },
      objectvalue: { callToAction: { label: 'Read more' } },
    });
    fireEvent.click(screen.getByLabelText('Show Call to action'));
    expect(onChangeObject).toHaveBeenCalledWith({
      callToAction: { label: 'Read more', enable: true },
    });

    fireEvent.click(screen.getByLabelText('Call to action settings'));
    const input = screen.getByTestId('elementsOrder-cta-callToAction.label');
    expect(input).toHaveValue('Read more');
    fireEvent.change(input, { target: { value: 'More info' } });
    expect(onChangeObject).toHaveBeenLastCalledWith({
      callToAction: { label: 'More info' },
    });
  });
});

describe('isElementVisible', () => {
  it('uses the default when the field is not set', () => {
    expect(
      isElementVisible(
        { field: 'hasDate', off: false, defaultVisible: true },
        {},
      ),
    ).toBe(true);
    expect(isElementVisible({ field: 'hasMetaType', off: false }, {})).toBe(
      false,
    );
  });

  it('is hidden only with the off value', () => {
    const toggle = { field: 'imagePosition', on: 'top', off: 'none' };
    expect(isElementVisible(toggle, { imagePosition: 'left' })).toBe(true);
    expect(isElementVisible(toggle, { imagePosition: 'none' })).toBe(false);
  });
});
