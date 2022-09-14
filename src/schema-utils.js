import { cloneDeep } from 'lodash';
import config from '@plone/volto/registry';

const addTypeSelect = ({ intl, schema, extensionName, messages }) => {
  const field = '@type';
  const extensions = config.blocks.blocksConfig.listing.extensions;
  const variations = extensions[extensionName];
  schema.properties[field] = {
    title: intl.formatMessage(messages.title),
    choices: variations.map(({ id, title }) => [id, title]),
    defaultValue: variations.find(({ isDefault }) => isDefault).id,
  };
  schema.fieldsets[0].fields.unshift(field);

  return schema;
};

export const enhanceSchema = ({ extensionName, messages }) => ({
  schema: originalSchema,
  formData,
  intl,
}) => {
  // const extensionName = 'itemTemplates';
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

  return addTypeSelect({ schema, intl, extensionName, messages });
};

export const getVoltoStyles = (props) => {
  const styles = props ? props : {};
  const output = {};
  for (const [key, value] of Object.entries(styles)) {
    if (styles[key] === true) {
      output[key] = key;
    } else {
      output[value] = value;
    }
  }
  return output;
};
