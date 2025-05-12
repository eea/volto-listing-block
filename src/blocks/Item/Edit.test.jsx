import React from 'react';
import { Provider } from 'react-intl-redux';
import { render, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

// Import the component after mocking dependencies
import Edit, { createSlateParagraph } from './Edit';
import { handleKey } from '@plone/volto-slate/blocks/Text/keyboard';

// Mock dependencies
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      slate: {
        defaultValue: () => [{ type: 'p', children: [{ text: '' }] }],
        textblockExtensions: [],
      },
    },
  },
}));

jest.mock('@plone/volto/components', () => ({
  BlockDataForm: jest.fn(({ children, onChangeField, schema, formData }) => (
    <div data-testid="block-data-form">
      <button
        data-testid="change-field-button"
        onClick={() => onChangeField('title', 'New Title')}
      >
        Change Field
      </button>
    </div>
  )),
  SidebarPortal: jest.fn(({ selected, children }) => (
    <div data-testid="sidebar-portal">{selected ? children : null}</div>
  )),
}));

// Mock the editor to expose renderExtensions for testing
let capturedRenderExtensions = [];

jest.mock('@plone/volto-slate/editor/SlateEditor', () => {
  return jest.fn((props) => {
    // Capture the renderExtensions when the component is rendered
    if (props.renderExtensions && props.renderExtensions.length > 0) {
      capturedRenderExtensions = props.renderExtensions;
    }

    return (
      <div
        data-testid="slate-editor"
        onClick={() => props.onFocus && props.onFocus()}
        onKeyDown={(e) => props.onKeyDown && props.onKeyDown(e)}
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
      >
        <button
          data-testid="change-description-button"
          onClick={() =>
            props.onChange &&
            props.onChange([
              { type: 'p', children: [{ text: 'Updated description' }] },
            ])
          }
        >
          Change Description
        </button>
      </div>
    );
  });
});

jest.mock('@plone/volto-slate/blocks/Text/keyboard', () => ({
  handleKey: jest.fn(),
}));

jest.mock('./Item', () => {
  return jest.fn(({ children, ...props }) => (
    <div data-testid="item-component" data-mode={props.mode}>
      {children}
    </div>
  ));
});

jest.mock('./schema', () => {
  return jest.fn().mockImplementation(() => ({
    title: 'Test Schema',
    fieldsets: [{ id: 'default', title: 'Default', fields: ['title'] }],
    properties: { title: { title: 'Title' } },
  }));
});

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
  slate_block_selections: {
    'block-123': { selectedBlocks: [] },
  },
  upload_content: {
    'block-123': {
      upload: { loading: false },
      data: { '@id': 'some-path' },
    },
  },
});

describe('createSlateParagraph', () => {
  it('returns the text if it is an array', () => {
    const text = [{ type: 'p', children: [{ text: 'Hello' }] }];
    expect(createSlateParagraph(text)).toBe(text);
  });

  it('returns default slate value if text is not an array', () => {
    const result = createSlateParagraph('Hello');
    expect(result).toEqual([{ type: 'p', children: [{ text: '' }] }]);
  });
});

describe('Edit Component', () => {
  const mockProps = {
    block: 'block-123',
    data: {
      description: [{ type: 'p', children: [{ text: 'Test description' }] }],
      title: 'Test title',
    },
    onChangeBlock: jest.fn(),
    onSelectBlock: jest.fn(),
    selected: false,
    index: 0,
    properties: {},
    id: 'test-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedRenderExtensions = [];
  });

  it('renders correctly with all required components', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} />
      </Provider>,
    );

    expect(getByTestId('item-component')).toBeInTheDocument();
    expect(getByTestId('item-component')).toHaveAttribute('data-mode', 'edit');
    expect(getByTestId('slate-editor')).toBeInTheDocument();
    expect(getByTestId('sidebar-portal')).toBeInTheDocument();
  });

  it('renders with default values when props are missing', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit />
      </Provider>,
    );

    expect(getByTestId('item-component')).toBeInTheDocument();
    expect(getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('calls onSelectBlock when editor is focused and not already selected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} />
      </Provider>,
    );

    fireEvent.click(getByTestId('slate-editor'));
    expect(mockProps.onSelectBlock).toHaveBeenCalledWith('block-123');
  });

  it('does not call onSelectBlock when already selected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} selected={true} />
      </Provider>,
    );

    fireEvent.click(getByTestId('slate-editor'));
    expect(mockProps.onSelectBlock).not.toHaveBeenCalled();
  });

  it('calls handleKey when key is pressed in editor', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} />
      </Provider>,
    );

    fireEvent.keyDown(getByTestId('slate-editor'), { key: 'Enter' });
    expect(handleKey).toHaveBeenCalled();
  });

  it('calls onChangeBlock when description is changed', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} />
      </Provider>,
    );

    fireEvent.click(getByTestId('change-description-button'));
    expect(mockProps.onChangeBlock).toHaveBeenCalledWith('block-123', {
      description: [{ type: 'p', children: [{ text: 'Updated description' }] }],
      title: 'Test title',
    });
  });

  it('calls onChangeField when field value is changed in BlockDataForm', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} selected={true} />
      </Provider>,
    );

    fireEvent.click(getByTestId('change-field-button'));
    expect(mockProps.onChangeBlock).toHaveBeenCalledWith('block-123', {
      description: [{ type: 'p', children: [{ text: 'Test description' }] }],
      title: 'New Title',
    });
  });

  it('uses withBlockProperties to provide block props to the editor', () => {
    render(
      <Provider store={store}>
        <Edit {...mockProps} />
      </Provider>,
    );

    // Check that we captured renderExtensions from SlateEditor
    expect(capturedRenderExtensions.length).toBe(1);

    // Test the withBlockProperties function
    const mockEditor = {};
    const enhancedEditor = capturedRenderExtensions[0](mockEditor);

    // Verify getBlockProps is added to the editor
    expect(enhancedEditor).toHaveProperty('getBlockProps');
    expect(typeof enhancedEditor.getBlockProps).toBe('function');

    // Verify the returned object contains our original props
    const returnedProps = enhancedEditor.getBlockProps();

    // Check for key properties we expect
    expect(returnedProps.block).toBe(mockProps.block);
    expect(returnedProps.id).toBe(mockProps.id);
    expect(returnedProps.data).toEqual(mockProps.data);
    expect(returnedProps.selected).toBe(mockProps.selected);
  });

  it('renders SidebarPortal with the correct props', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} selected={true} />
      </Provider>,
    );

    const sidebarPortal = getByTestId('sidebar-portal');
    expect(sidebarPortal).toBeInTheDocument();
    expect(sidebarPortal.children.length).toBeGreaterThan(0);
  });

  it('does not render BlockDataForm in SidebarPortal when not selected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Edit {...mockProps} selected={false} />
      </Provider>,
    );

    const sidebarPortal = getByTestId('sidebar-portal');
    expect(sidebarPortal).toBeInTheDocument();
    expect(sidebarPortal.children.length).toBe(0);
  });
});

describe('Edit Component Redux Connection', () => {
  it('correctly connects to Redux store', () => {
    const ConnectedEdit = Edit;
    const { getByTestId } = render(
      <Provider store={store}>
        <ConnectedEdit block="block-123" />
      </Provider>,
    );
    expect(getByTestId('item-component')).toBeInTheDocument();
  });
});
