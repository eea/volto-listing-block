import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsList from './NewsList';
import moment from 'moment';
import '@testing-library/jest-dom/extend-expect';

describe('NewsList', () => {
  const items = [
    {
      '@id': '/news/item1',
      title: 'News Item 1',
      effective: '2023-06-01T00:00:00',
      description: 'Description of News Item 1',
    },
    {
      '@id': '/news/item2',
      title: 'News Item 2',
      effective: '2023-06-02T00:00:00',
      description: 'Description of News Item 2',
    },
  ];

  it('renders news items correctly', () => {
    render(
      <MemoryRouter>
        <NewsList items={items} hasDate hasDescription />
      </MemoryRouter>,
    );

    items.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    });
  });

  it('renders publication date when hasDate is true', () => {
    render(
      <MemoryRouter>
        <NewsList items={items} hasDate />
      </MemoryRouter>,
    );

    items.forEach((item) => {
      expect(screen.getAllByText(/Published:/)).toHaveLength(2);
      expect(
        screen.getByText(moment(item.effective).format('ll')),
      ).toBeInTheDocument();
    });
  });

  it('does not render publication date when hasDate is false', () => {
    render(
      <MemoryRouter>
        <NewsList items={items} hasDate={false} />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Published:/)).not.toBeInTheDocument();
  });

  it('renders description when hasDescription is true', () => {
    render(
      <MemoryRouter>
        <NewsList items={items} hasDescription />
      </MemoryRouter>,
    );

    items.forEach((item) => {
      expect(screen.getByText(item.description)).toBeInTheDocument();
    });
  });

  it('does not render description when hasDescription is false', () => {
    render(
      <MemoryRouter>
        <NewsList items={items} hasDescription={false} />
      </MemoryRouter>,
    );

    items.forEach((item) => {
      expect(screen.queryByText(item.description)).not.toBeInTheDocument();
    });
  });

  it('renders nothing when items array is empty', () => {
    render(
      <MemoryRouter>
        <NewsList items={[]} />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/News Item/)).not.toBeInTheDocument();
  });
});
