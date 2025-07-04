import React from 'react';
import Item from './Item';

import { isArray } from 'lodash';
import { serializeNodes } from '@plone/volto-slate/editor/render';

export const serializeText = (text) => {
  return isArray(text) ? serializeNodes(text) : text;
};

const View = (props) => {
  const { data = {} } = props;
  return (
    <Item
      {...data}
      description={data.description ? serializeText(data.description) : null}
    />
  );
};

export default View;
