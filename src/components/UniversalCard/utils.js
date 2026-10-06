export const getMaxLinesClasses = (itemModel = {}) => {
  const res = {};
  if (itemModel.maxDescription) {
    res[`max-${itemModel.maxDescription}-lines`] = true;
  }
  if (itemModel.maxTitle) {
    res[`title-max-${itemModel.maxTitle}-lines`] = true;
  }
  return res;
};

export const getItemLabel = (item, itemModel = {}) => {
  const text = item.isNew ? 'New' : item.isExpired ? 'Archived' : null;

  return itemModel?.hasLabel && text
    ? {
        text,
        side: true,
        // TODO: set the colors from css?
        color: item.isExpired ? 'yellow' : 'green',
      }
    : null;
};
