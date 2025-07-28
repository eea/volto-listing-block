import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import VisualizationCards from './VisualizationCards';

// Mock the dependencies
// First mock the default export
jest.mock('@plone/volto/registry', () => ({
  default: {
    settings: {
      dateLocale: 'en',
    },
  },
}));

// Then mock the direct import of config
jest.mock(
  '@plone/volto/registry',
  () => ({
    settings: {
      dateLocale: 'en',
    },
  }),
  { virtual: true },
);

jest.mock(
  '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard',
  () => {
    return jest.fn(({ item }) => (
      <div data-testid="universal-card">
        <div data-testid="card-title">{item.title}</div>
        <div data-testid="card-id">{item['@id']}</div>
      </div>
    ));
  },
);

// Mock moment
jest.mock('moment', () => {
  const mockMoment = () => ({
    locale: jest.fn(),
    format: jest.fn(() => 'formatted-date'),
  });
  mockMoment.locale = jest.fn();
  return mockMoment;
});

// Mock the getVocabulary action
const mockGetVocabulary = jest.fn();
jest.mock('@plone/volto/actions', () => ({
  getVocabulary: (...args) => {
    mockGetVocabulary(...args);
    return { type: 'GET_VOCABULARY' };
  },
}));

const mockStore = configureStore([]);

describe('VisualizationCards', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      vocabularies: {
        'collective.taxonomy.benchmark_level': {
          items: [
            { value: 'level1', label: 'Level 1' },
            { value: 'level2', label: 'Level 2' },
          ],
        },
      },
    });
    mockGetVocabulary.mockClear();
  });

  const items = [
    {
      '@id': '/visualization/item1',
      title: 'Visualization Item 1',
      description: 'Description of Visualization Item 1',
    },
    {
      '@id': '/visualization/item2',
      title: 'Visualization Item 2',
      description: 'Description of Visualization Item 2',
    },
  ];

  it('renders visualization items correctly', () => {
    render(
      <Provider store={store}>
        <VisualizationCards items={items} />
      </Provider>,
    );

    // Check if UniversalCard components are rendered for each item
    const cards = screen.getAllByTestId('universal-card');
    expect(cards).toHaveLength(2);

    // Check if titles are rendered
    expect(screen.getByText('Visualization Item 1')).toBeInTheDocument();
    expect(screen.getByText('Visualization Item 2')).toBeInTheDocument();
  });

  it('applies the correct grid size class', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCards items={items} gridSize="five" />
      </Provider>,
    );

    // Check if the grid size class is applied
    expect(container.querySelector('.ui.fluid.five.cards')).toBeInTheDocument();
  });

  it('applies a different grid size class when specified', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCards items={items} gridSize="six" />
      </Provider>,
    );

    // Check if the grid size class is applied
    expect(container.querySelector('.ui.fluid.six.cards')).toBeInTheDocument();
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCards items={[]} />
      </Provider>,
    );

    // Check if no cards are rendered
    expect(container.querySelector('.ui.fluid.cards')).not.toBeInTheDocument();
  });

  it('passes props to UniversalCard component', () => {
    // Clear previous calls
    const UniversalCardMock = require('@eeacms/volto-listing-block/components/UniversalCard/UniversalCard');
    UniversalCardMock.mockClear();

    render(
      <Provider store={store}>
        <VisualizationCards
          items={[items[0]]} // Use only one item to simplify testing
          block="test-block"
          isEditMode={true}
          hasDate={true}
          hasDescription={true}
        />
      </Provider>,
    );

    // Check that the props are passed correctly
    expect(UniversalCardMock).toHaveBeenCalled();
    const callProps = UniversalCardMock.mock.calls[0][0];

    // Only check the props that we know are passed
    expect(callProps.item).toEqual(items[0]);
    expect(callProps.block).toBe('test-block');
  });

  it('fetches the benchmark_level vocabulary on mount', () => {
    render(
      <Provider store={store}>
        <VisualizationCards items={items} />
      </Provider>,
    );

    // Check if getVocabulary action is dispatched with the correct parameters
    expect(mockGetVocabulary).toHaveBeenCalledWith({
      vocabNameOrURL: 'collective.taxonomy.benchmark_level',
    });
  });

  describe('schemaEnhancer', () => {
    it('enhances schema correctly', () => {
      const schema = {
        fieldsets: [{ id: 'default', fields: [] }],
        properties: {},
      };

      const enhancedSchema = VisualizationCards.schemaEnhancer({ schema });

      // Check if the new fieldset is added
      expect(enhancedSchema.fieldsets[1].id).toBe('cardsVisualization');
      expect(enhancedSchema.fieldsets[1].title).toBe('Visualization Cards');
      expect(enhancedSchema.fieldsets[1].fields).toContain('gridSize');

      // Check if the gridSize property is added
      expect(enhancedSchema.properties.gridSize).toBeDefined();
      expect(enhancedSchema.properties.gridSize.title).toBe('Grid Size');
      expect(enhancedSchema.properties.gridSize.choices).toEqual([
        ['four', 'Four'],
        ['five', 'Five'],
        ['six', 'Six'],
      ]);
      expect(enhancedSchema.properties.gridSize.default).toBe('five');
    });
  });
});
