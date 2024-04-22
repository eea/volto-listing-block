import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Item from './Item';

describe('Item', () => {
  it('renders the icon, description, and applies correct classes', () => {
    const data = {
      '@type': 'item',
      assetType: 'icon',
      icon: 'ri-home-line',
      iconSize: 'big',
      imageSize: 'big',
      verticalAlign: 'middle',
      description: 'some text',
    };

    const { container } = render(<Item {...data} />);

    const icon = container.querySelector('i');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('ri-home-line');
    expect(icon).toHaveClass('big');
    expect(icon).toHaveClass('middle');
    expect(icon).toHaveClass('aligned');

    const description = screen.getByText('some text');
    expect(description).toBeInTheDocument();
    expect(description.closest('div')).toHaveClass('description');

    expect(container.querySelector('div.item')).toBeInTheDocument();
  });
});
