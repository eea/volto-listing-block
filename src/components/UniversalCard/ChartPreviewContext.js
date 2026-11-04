import React from 'react';
import { useSelector } from 'react-redux';
import { isChartItem } from './preview';

// Whether the edited block shows interactive charts, so the sidebar offers
// the chart preview only where it changes something
const ChartPreviewContext = React.createContext(false);

export const useHasCharts = () => React.useContext(ChartPreviewContext);

const getBlockItems = (state, block) => [
  ...(state.querystringsearch?.subrequests?.[block]?.items || []),
  ...(state.search?.subrequests?.[block]?.items || []),
];

/**
 * The listing and search results of the block, or the content chosen in a
 * teaser.
 */
export const useBlockHasCharts = (block, data) =>
  useSelector(
    (state) =>
      getBlockItems(state, block).some(isChartItem) ||
      (data?.href || []).some(isChartItem),
  );

export default ChartPreviewContext;
