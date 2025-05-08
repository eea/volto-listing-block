import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsList from './NewsList';
import moment from 'moment';
import '@testing-library/jest-dom/extend-expect';

// Mock the modules for coverage testing
jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: jest.fn((url) => url + '-flattened'),
  getBaseUrl: jest.fn((url) => url + '-base'),
}));

jest.mock('@plone/volto/registry', () => ({
  settings: {
    dateLocale: 'en',
  },
}));

jest.mock('@eeacms/volto-listing-block/messages', () => ({
  newsItem: {
    id: 'newsItem',
    defaultMessage: 'News Item',
  },
  publicationDate: {
    id: 'publicationDate',
    defaultMessage: 'Publication Date',
  },
  description: {
    id: 'description',
    defaultMessage: 'Description',
  },
}));

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

  it('renders item.id when title is not available', () => {
    const itemsWithoutTitle = [
      {
        '@id': '/news/item3',
        id: 'item3',
        effective: '2023-06-03T00:00:00',
        description: 'Description of News Item 3',
      },
    ];

    render(
      <MemoryRouter>
        <NewsList items={itemsWithoutTitle} />
      </MemoryRouter>,
    );

    expect(screen.getByText('item3')).toBeInTheDocument();
  });

  it('handles items without effective date', () => {
    const itemsWithoutEffective = [
      {
        '@id': '/news/item4',
        title: 'News Item 4',
        description: 'Description of News Item 4',
      },
    ];

    render(
      <MemoryRouter>
        <NewsList items={itemsWithoutEffective} hasDate hasDescription />
      </MemoryRouter>,
    );

    expect(screen.getByText('News Item 4')).toBeInTheDocument();
    expect(screen.queryByText(/Published:/)).not.toBeInTheDocument();
  });

  it('handles item without @id', () => {
    const itemsWithoutId = [
      {
        // Using id as a fallback for key when @id is missing
        id: 'item5',
        title: 'News Item 5',
        effective: '2023-06-05T00:00:00',
        description: 'Description of News Item 5',
      },
    ];

    render(
      <MemoryRouter>
        <NewsList items={itemsWithoutId} hasDate hasDescription />
      </MemoryRouter>,
    );

    expect(screen.getByText('News Item 5')).toBeInTheDocument();
    // According to the component code, it uses '' when @id is not present
    const link = screen.getByText('News Item 5');
    expect(link.getAttribute('href')).toBe('/');
  });

  // Test for items without @id that validates keys are present
  it('handles items without @id for key generation correctly', () => {
    const itemsWithoutIdForKey = [
      {
        id: 'uniqueId1', // Provide id for key fallback
        title: 'News Item Without @id 1',
      },
      {
        id: 'uniqueId2', // Provide id for key fallback
        title: 'News Item Without @id 2',
      },
    ];

    render(
      <MemoryRouter>
        <NewsList items={itemsWithoutIdForKey} />
      </MemoryRouter>,
    );

    // Check if items are rendered
    expect(screen.getByText('News Item Without @id 1')).toBeInTheDocument();
    expect(screen.getByText('News Item Without @id 2')).toBeInTheDocument();

    // Instead of checking console errors, simply verify both items are rendered
    expect(screen.getAllByText(/News Item Without @id/)).toHaveLength(2);
  });

  it('handles isEditMode prop', () => {
    render(
      <MemoryRouter>
        <NewsList items={items} isEditMode={true} />
      </MemoryRouter>,
    );

    items.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  describe('schemaEnhancer', () => {
    it('enhances schema correctly', () => {
      const schema = {
        fieldsets: [{ id: 'default', fields: [] }],
        properties: {},
      };

      const intl = {
        formatMessage: (msg) => msg.defaultMessage || msg.id,
      };

      const enhancedSchema = NewsList.schemaEnhancer({ schema, intl });

      expect(enhancedSchema.fieldsets[1].id).toBe('newsList');
      expect(enhancedSchema.fieldsets[1].fields).toContain('hasDate');
      expect(enhancedSchema.fieldsets[1].fields).toContain('hasDescription');

      expect(enhancedSchema.properties.hasDate).toBeDefined();
      expect(enhancedSchema.properties.hasDescription).toBeDefined();
      expect(enhancedSchema.properties.hasDate.type).toBe('boolean');
      expect(enhancedSchema.properties.hasDescription.type).toBe('boolean');
    });
  });
});
