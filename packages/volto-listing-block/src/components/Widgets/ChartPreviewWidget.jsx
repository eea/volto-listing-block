import React from 'react';
import SelectWidget from '@plone/volto/components/manage/Widgets/SelectWidget';
import { useHasCharts } from '@eeacms/volto-listing-block/components/UniversalCard/ChartPreviewContext';

/**
 * The choice between the preview image and the miniature of the interactive
 * charts, shown only when the block displays such charts. Until it is
 * stored, the default (what the cards render) is selected.
 */
const ChartPreviewWidget = (props) =>
  useHasCharts() ? (
    <SelectWidget {...props} value={props.value ?? props.default} />
  ) : null;

export default ChartPreviewWidget;
