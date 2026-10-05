import {
  DefaultCardModelSchema,
  schemaEnhancerFactory,
  addTypeSelect,
} from '@eeacms/volto-listing-block/schema-utils';
import { migrateItemModel } from './migrate';

export default function universalCardSchemaEnhancer(args) {
  const props = { ...args };
  const { schema, intl } = props;

  const formData = props.formData || props.data;
  // build the schema for the consolidated model, also for legacy data
  props.formData = formData?.itemModel
    ? { ...formData, itemModel: migrateItemModel(formData.itemModel) }
    : formData;
  const extensionName = 'cardTemplates';
  const enhancer = schemaEnhancerFactory({
    extensionName,
    blockType: 'listing',
    extensionField: '@type',
  });

  schema.fieldsets.push({
    id: 'cardDesigner',
    title: 'Card',
    fields: ['itemModel'],
  });

  const itemModelSchema = addTypeSelect({
    ...props,
    schema: DefaultCardModelSchema(intl),
    extensionName,
  });

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

  return enhancedSchema;
}
