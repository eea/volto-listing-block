import PropTypes from 'prop-types';
import cx from 'classnames';
import { useState } from 'react';
import ContainerEdit from '@plone/volto/components/manage/Blocks/Container/Edit';
import '../../../../../../less/teaser-cards.less';
const GridBlockEdit = (props) => {
  const { data } = props;

  const columnsLength =
    data?.blocks_layout?.items?.length || data?.columns || 0;

  const [selectedBlock, setSelectedBlock] = useState(null);

  const convertTeaserToGridIfNecessary = (data) => {
    if (data?.['@type'] === 'teaserGrid')
      return {
        ...data,
        blocks_layout: { items: data?.columns.map((c) => c.id) },
        blocks: data?.columns?.reduce((acc, current) => {
          return {
            ...acc,
            [current?.id]: current,
          };
        }, {}),
      };
    return data;
  };
  console.log(columnsLength);
  return (
    <div
      className={cx({
        one: columnsLength === 1,
        two: columnsLength === 2,
        three: columnsLength === 3,
        four: columnsLength >= 4,
        'grid-items': true,
      })}
      // This is required to enabling a small "in-between" clickable area
      // for bringing the Grid sidebar alive once you have selected an inner block
      onClick={(e) => {
        if (!e.block) setSelectedBlock(null);
      }}
      role="presentation"
    >
      <ContainerEdit
        {...props}
        data={convertTeaserToGridIfNecessary(data)}
        content={convertTeaserToGridIfNecessary(data)}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        direction="horizontal"
      />
    </div>
  );
};

GridBlockEdit.propTypes = {
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  manage: PropTypes.bool.isRequired,
};

export default GridBlockEdit;
