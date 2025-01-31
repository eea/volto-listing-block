import {
  DefaultCardModelSchema,
  schemaEnhancerFactory,
  addTypeSelect,
} from '@eeacms/volto-listing-block/schema-utils';

export default function universalCardSchemaEnhancer(args) {
  const props = { ...args };
  const { schema, intl } = props;

  props.formData = props.formData || props.data;
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
    ...args,
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
        widget: 'object',
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
