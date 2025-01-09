import { defineMessages } from 'react-intl';
import {
  DefaultCardModelSchema,
  schemaEnhancerFactory,
  addTypeSelect,
} from '@eeacms/volto-listing-block/schema-utils';

const messages = defineMessages({
  title: {
    id: 'Card type',
    defaultMessage: 'Card type',
  },
});

export default function universalCardSchemaEnhancer(args) {
  const props = { ...args };
  const { schema, intl } = props;

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
    title: 'Card',
    fields: ['itemModel'],
  });

  const itemModelSchema = addTypeSelect({
    ...args,
    schema: DefaultCardModelSchema(intl),
    extensionName,
    messages,
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
