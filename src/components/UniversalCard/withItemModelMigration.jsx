import React from 'react';
import { migrateItemModel } from './migrate';

export const migrateBlockItemModel = (data) => {
  const itemModel = migrateItemModel(data?.itemModel);
  return itemModel === data?.itemModel ? data : { ...data, itemModel };
};

/**
 * Wraps a block edit component (listing, teaser) and, once the block is
 * selected, rewrites legacy block data (card template ids, removed layout
 * variations) to the consolidated model. `migrate` returns the same object
 * when nothing needs to change. The view side migrates on the fly.
 */
export default function withItemModelMigration(
  WrappedComponent,
  migrate = migrateBlockItemModel,
) {
  if (!WrappedComponent || WrappedComponent.__withItemModelMigration) {
    return WrappedComponent;
  }

  const WithItemModelMigration = (props) => {
    const { data, block, onChangeBlock, selected } = props;
    const migrated = React.useMemo(() => migrate(data), [data]);
    const needsMigration = migrated !== data;

    React.useEffect(() => {
      if (selected && needsMigration && onChangeBlock) {
        onChangeBlock(block, migrated);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, needsMigration]);

    // render what the view renders, also before the data is rewritten
    return <WrappedComponent {...props} data={migrated} />;
  };

  WithItemModelMigration.displayName = `WithItemModelMigration(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  WithItemModelMigration.__withItemModelMigration = true;

  return WithItemModelMigration;
}
