import {
  DefaultCardModelSchema,
  schemaEnhancerFactory,
  addTypeSelect,
} from '@eeacms/volto-listing-block/schema-utils';
import messages from '@eeacms/volto-listing-block/messages';

export default function universalCardSchemaEnhancer(args) {
  const props = { ...args };
  const { schema } = props;

  props.formData = props.formData || props.data;
  const extensionName = 'cardTemplates';
  const enhancer = schemaEnhancerFactory({
    extensionName,
    messages,
    blockType: 'listing',
    extensionField: '@type',
  });

  schema.fieldsets.push({
    id: 'cardDesigner',
    title: intl.formatMessage(messages.Card),
    fields: ['itemModel'],
  });

  const itemModelSchema = addTypeSelect({
    ...args,
    schema: DefaultCardModelSchema,
    extensionName,
    messages,
  });

  const baseSchema = {
    ...schema,
    fieldsets: [...schema.fieldsets],
    properties: {
      ...schema.properties,
      itemModel: {
        title: intl.formatMessage(messages.CardModel),
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
