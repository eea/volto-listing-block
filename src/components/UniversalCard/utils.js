import { cloneDeep } from 'lodash';
import config from '@plone/volto/registry';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  cardType: {
    id: 'Card type',
    defaultMessage: 'Card type',
  },
});

const addTypeSelect = ({ intl, schema }) => {
  const field = '@type';
  const extensionName = 'cardTemplates';
  const extensions = config.blocks.blocksConfig.listing.extensions;
  const variations = extensions[extensionName];
  schema.properties[field] = {
    title: intl.formatMessage(messages.cardType),
    choices: variations.map(({ id, title }) => [id, title]),
    defaultValue: variations.find(({ isDefault }) => isDefault).id,
  };
  schema.fieldsets[0].fields.unshift(field);

  return schema;
};

export const enhanceSchema = ({ schema: originalSchema, formData, intl }) => {
  const extensionName = 'cardTemplates';
  const extensionType = '@type'; // property name in stored block data
  const extensions = config.blocks.blocksConfig.listing.extensions;
  const variations = extensions[extensionName];

  const activeItemName = formData?.[extensionType];
  let activeItem = variations?.find((item) => item.id === activeItemName);
  if (!activeItem) activeItem = variations?.find((item) => item.isDefault);

  const schemaEnhancer = activeItem?.['schemaEnhancer'];

  let schema = schemaEnhancer
    ? schemaEnhancer({ schema: cloneDeep(originalSchema), formData, intl })
    : cloneDeep(originalSchema);

  return addTypeSelect({ schema, intl });
};
