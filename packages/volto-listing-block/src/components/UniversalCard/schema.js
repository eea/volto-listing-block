import omit from 'lodash/omit';
import {
  DefaultCardModelSchema,
  schemaEnhancerFactory,
  addTypeSelect,
} from '@eeacms/volto-listing-block/schema-utils';
import {
  CARD,
  ITEM,
  getLayoutItemModel,
  getLayoutItemType,
  needsItemModelMigration,
} from './migrate';
import { keepLegacyLayoutsOnGrid } from '@eeacms/volto-listing-block/blocks/Listing/variations';
import messages from '@eeacms/volto-listing-block/messages';

export default function universalCardSchemaEnhancer(args) {
  const props = { ...args };
  const { schema, intl } = props;

  const formData = props.formData || props.data;
  // build the schema for the consolidated model and layout, also for legacy
  // data, so the block defaults Volto applies are the migrated values
  const layoutField = formData?.listingBodyTemplate
    ? 'listingBodyTemplate'
    : 'variation';
  const layoutData = keepLegacyLayoutsOnGrid(formData, layoutField);
  const layout =
    layoutData?.listingBodyTemplate ||
    layoutData?.variation ||
    (layoutData?.['@type'] === 'listing' ? 'summary' : undefined);
  props.formData = {
    ...layoutData,
    itemModel: getLayoutItemModel(layoutData?.itemModel, layout),
  };
  const extensionName = 'cardTemplates';
  const enhancer = schemaEnhancerFactory({
    extensionName,
    blockType: 'listing',
    extensionField: '@type',
  });

  schema.fieldsets.push({
    id: 'cardDesigner',
    title: intl.formatMessage(
      props.formData.itemModel?.['@type'] === 'item'
        ? messages.itemTemplate
        : messages.cardTemplate,
    ),
    fields: ['itemModel'],
  });

  const itemModelSchema = addTypeSelect({
    ...props,
    schema: DefaultCardModelSchema(intl),
    extensionName,
  });
  const layoutType = getLayoutItemType(layout);
  if (layoutType) {
    // The layout picks between our two templates, the select only offers it
    // together with the templates registered by other add-ons, if any
    const typeField = itemModelSchema.properties['@type'];
    const otherType = layoutType === ITEM ? CARD : ITEM;
    typeField.choices = typeField.choices.filter(([id]) => id !== otherType);
    typeField.default = layoutType;
    if (typeField.choices.length <= 1) {
      itemModelSchema.fieldsets[0].fields =
        itemModelSchema.fieldsets[0].fields.filter(
          (field) => field !== '@type',
        );
    }
  }

  const baseSchema = {
    ...schema,
    fieldsets: [...schema.fieldsets],
    properties: {
      ...schema.properties,
      itemModel: {
        title: 'Card model',
        // ObjectWidget that lets the card elements widget edit sibling fields
        widget: 'card_model',
        schema: itemModelSchema,
      },
    },
  };

  const enhancedSchema = enhancer({
    ...props,
    schema: baseSchema,
  });

  // Without a default position a legacy card model stays legacy once Volto
  // applies the block defaults, in any container. The view then still
  // migrates it: a List of legacy cards renders as the Grid, and the controls
  // the legacy templates did not render stay off.
  const modelProperties =
    enhancedSchema.properties.itemModel?.schema?.properties;
  if (
    needsItemModelMigration(formData?.itemModel) &&
    modelProperties?.imagePosition
  ) {
    enhancedSchema.properties.itemModel.schema.properties = {
      ...modelProperties,
      imagePosition: omit(modelProperties.imagePosition, 'default'),
    };
  }

  return enhancedSchema;
}
