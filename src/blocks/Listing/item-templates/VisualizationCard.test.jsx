import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import VisualizationCardComponent from './VisualizationCard';

const mockStore = configureStore([]);

// Mock the UniversalCard components
jest.mock('@eeacms/volto-listing-block/components/UniversalCard', () => ({
  CardDescription: jest.fn(() => (
    <div data-testid="card-description">Description</div>
  )),
  CardExtra: jest.fn(() => <div data-testid="card-extra">Extra</div>),
  CardImage: jest.fn(() => <div data-testid="card-image">Image</div>),
  CardMeta: jest.fn(() => <div data-testid="card-meta">Meta</div>),
  CardTitle: jest.fn(() => <div data-testid="card-title">Title</div>),
}));

describe('VisualizationCard', () => {
  const mockItem = {
    '@id': '/test-item',
    title: 'Test Item',
    description: 'Test Description',
  };

  const mockProps = {
    item: mockItem,
    className: 'test-class',
    itemModel: {
      maxDescription: 3,
      maxTitle: 2,
    },
  };

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
  });

  it('renders correctly with basic props', () => {
    const { container } = render(
      <Provider store={store}>
        <VisualizationCardComponent {...mockProps} />
      </Provider>,
    );

    // Check if the card is rendered with correct classes
    const card = container.querySelector('.ui.fluid.card.u-card.test-class');
    expect(card).not.toBeNull();

    // Check if the card has max-lines classes from getStyles
    expect(card.classList.contains('max-3-lines')).toBe(true);
    expect(card.classList.contains('title-max-2-lines')).toBe(true);

    // Check if all card components are rendered
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('card-description')).toBeInTheDocument();
    expect(screen.getByTestId('card-image')).toBeInTheDocument();
    expect(screen.getByTestId('card-meta')).toBeInTheDocument();
    expect(screen.getByTestId('card-extra')).toBeInTheDocument();
  });

  it('renders with image position right', () => {
    const propsWithRightImage = {
      ...mockProps,
      imagePosition: 'right',
    };

    const { getAllByTestId } = render(
      <Provider store={store}>
        <VisualizationCardComponent {...propsWithRightImage} />
      </Provider>,
    );

    // Should have two card-image components when imagePosition is right
    const images = getAllByTestId('card-image');
    expect(images).toHaveLength(2);
  });

  it('renders with image position other than right', () => {
    const propsWithLeftImage = {
      ...mockProps,
      imagePosition: 'left',
    };

    const { getAllByTestId } = render(
      <Provider store={store}>
        <VisualizationCardComponent {...propsWithLeftImage} />
      </Provider>,
    );

    // Should have only one card-image component when imagePosition is not right
    const images = getAllByTestId('card-image');
    expect(images).toHaveLength(1);
  });

  it('renders with preview_image_url', () => {
    render(
      <Provider store={store}>
        <VisualizationCardComponent {...mockProps} />
      </Provider>,
    );

    // Check if CardImage is called with the correct preview_image_url
    expect(
      require('@eeacms/volto-listing-block/components/UniversalCard').CardImage,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        preview_image_url: '/test-item/@@plotly_preview.svg/soer_miniature',
      }),
      expect.anything(),
    );
  });
});

describe('CardEEABenchmarkLevel', () => {
  const mockStore = configureStore([]);

  it('renders null when benchmark_level is not present', () => {
    const store = mockStore({
      vocabularies: {
        'collective.taxonomy.benchmark_level': {
          items: [
            { value: 'level1', label: 'Level 1' },
            { value: 'level2', label: 'Level 2' },
          ],
        },
      },
    });

    const ConnectedVisualizationCard = require('./VisualizationCard').default;

    const { container } = render(
      <Provider store={store}>
        <ConnectedVisualizationCard
          item={{ '@id': '/test-item' }}
          className="test-class"
        />
      </Provider>,
    );

    // Benchmark level wrapper should not be present
    expect(container.querySelector('.benchmark_level_wrapper')).toBeNull();
  });

  it('renders benchmark level when present', () => {
    const store = mockStore({
      vocabularies: {
        'collective.taxonomy.benchmark_level': {
          items: [
            { value: 'level1', label: 'Level 1' },
            { value: 'level2', label: 'Level 2' },
          ],
        },
      },
    });

    const ConnectedVisualizationCard = require('./VisualizationCard').default;

    const { container } = render(
      <Provider store={store}>
        <ConnectedVisualizationCard
          item={{
            '@id': '/test-item',
            benchmark_level: ['level1'],
          }}
          className="test-class"
        />
      </Provider>,
    );

    // Benchmark level wrapper should be present
    const benchmarkWrapper = container.querySelector(
      '.benchmark_level_wrapper',
    );
    expect(benchmarkWrapper).not.toBeNull();

    // Benchmark level element should have the correct class
    const benchmarkLevel = benchmarkWrapper.querySelector('.benchmark_level');
    expect(benchmarkLevel).not.toBeNull();
    expect(benchmarkLevel.classList.contains('level1')).toBe(true);

    // Benchmark level label should be present
    expect(benchmarkWrapper.textContent).toContain('Level 1');
  });

  it('renders benchmark level without label when item not found in vocabulary', () => {
    const store = mockStore({
      vocabularies: {
        'collective.taxonomy.benchmark_level': {
          items: [
            { value: 'level1', label: 'Level 1' },
            { value: 'level2', label: 'Level 2' },
          ],
        },
      },
    });

    const ConnectedVisualizationCard = require('./VisualizationCard').default;

    const { container } = render(
      <Provider store={store}>
        <ConnectedVisualizationCard
          item={{
            '@id': '/test-item',
            benchmark_level: ['unknown-level'],
          }}
          className="test-class"
        />
      </Provider>,
    );

    // Benchmark level wrapper should be present
    const benchmarkWrapper = container.querySelector(
      '.benchmark_level_wrapper',
    );
    expect(benchmarkWrapper).not.toBeNull();

    // Benchmark level element should have the correct class
    const benchmarkLevel = benchmarkWrapper.querySelector('.benchmark_level');
    expect(benchmarkLevel).not.toBeNull();
    expect(benchmarkLevel.classList.contains('unknown-level')).toBe(true);

    // No label should be present (or it should be empty)
    expect(benchmarkWrapper.textContent.trim()).toBe('');
  });
});
