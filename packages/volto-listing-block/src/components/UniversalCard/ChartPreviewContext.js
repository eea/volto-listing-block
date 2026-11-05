import React from 'react';
import { useSelector } from 'react-redux';
import { isChartItem } from './preview';

// Whether the edited block shows interactive charts, so the sidebar offers
// the chart preview only where it changes something
const ChartPreviewContext = React.createContext(false);

export const useHasCharts = () => React.useContext(ChartPreviewContext);

// Volto keys the results by the block id, prefixed by the content UID when
// the listing knows its content (`<UID>-<block>`)
const isBlockRequest = (key, block) =>
  key === block || key.endsWith(`-${block}`);

const getRequestItems = (subrequests = {}, block) =>
  Object.keys(subrequests)
    .filter((key) => isBlockRequest(key, block))
    .flatMap((key) => subrequests[key]?.items || []);

const getBlockItems = (state, block) =>
  block
    ? [
        ...getRequestItems(state.querystringsearch?.subrequests, block),
        ...getRequestItems(state.search?.subrequests, block),
      ]
    : [];

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
