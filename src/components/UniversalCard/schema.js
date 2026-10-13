import {
  DefaultCardModelSchema,
  schemaEnhancerFactory,
  addTypeSelect,
} from '@eeacms/volto-listing-block/schema-utils';
import { getLayoutItemModel, getLayoutItemType } from './migrate';
import messages from '@eeacms/volto-listing-block/messages';

export default function universalCardSchemaEnhancer(args) {
  const props = { ...args };
  const { schema, intl } = props;

  const formData = props.formData || props.data;
  // build the schema for the consolidated model, also for legacy data
  const layout =
    formData?.listingBodyTemplate ||
    formData?.variation ||
    (formData?.['@type'] === 'listing' ? 'summary' : undefined);
  props.formData = {
    ...formData,
    itemModel: getLayoutItemModel(formData?.itemModel, layout),
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
  if (getLayoutItemType(layout)) {
    itemModelSchema.fieldsets[0].fields =
      itemModelSchema.fieldsets[0].fields.filter((field) => field !== '@type');
    itemModelSchema.properties['@type'].default = getLayoutItemType(layout);
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

  return enhancedSchema;
}
