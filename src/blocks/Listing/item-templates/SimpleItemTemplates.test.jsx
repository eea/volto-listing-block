import React from 'react';
import { render } from '@testing-library/react';
import { SimpleItemLayout } from './SimpleItemTemplates';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/components', () => ({
  ConditionalLink: ({ children }) => (
    <>
      <div>ConditionalLink</div>
      {children}
    </>
  ),
}));

describe('SimpleItemLayout', () => {
  const props = {
    item: {
      title: 'Test Title',
      description: 'Test Description',
    },
    itemModel: {
      '@type': 'Document',
    },
    className: 'my-class',
  };

  it('renders without crashing', () => {
    const { container } = render(<SimpleItemLayout {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('renders the title', () => {
    const { getByText } = render(<SimpleItemLayout {...props} />);
    expect(getByText(props.item.title)).toBeInTheDocument();
  });

  it('renders correct className', () => {
    const { container } = render(<SimpleItemLayout {...props} />);
    expect(container.firstElementChild).toHaveClass(props.className);
  });
});
