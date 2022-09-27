import { cloneDeep } from 'lodash';
import config from '@plone/volto/registry';

import { defineMessages } from 'react-intl';

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

// Creates a factory that can trigger schemaEnhancer for a given extension
export const schemaEnhancerFactory = ({
  extensionName,
  messages,
  blockType = 'listing',
  extensionField = '@type',
}) => ({ schema: originalSchema, formData, intl }) => {
  //
  // the attribute name that's stored in the block data
  // it identifies the type of extension that's
  // applied. Similar in scope, for example, with the block @type

  const blockConfig = config.blocks.blocksConfig[blockType];
  const extensions = blockConfig.extensions;
  const templates = extensions[extensionName];

  const activeItemName = formData?.[extensionField];
  let activeItem = templates?.find((item) => item.id === activeItemName);
  if (!activeItem) activeItem = templates?.find((item) => item.isDefault);

  const schemaEnhancer = activeItem?.['schemaEnhancer'];

  let schema = schemaEnhancer
    ? schemaEnhancer({ schema: cloneDeep(originalSchema), formData, intl })
    : cloneDeep(originalSchema);

  return addTypeSelect({ schema, intl, extensionName, messages });
};

const messages = defineMessages({
  variation: {
    id: 'Variation',
    defaultMessage: 'Variation',
  },
  styling: {
    id: 'Styling',
    defaultMessage: 'Styling',
  },
});

const addStylesField = ({ schema, intl, formData }) => {
  // Add the default style schema as the first step in the "ladder".
  // The order is as follows:
  //
  // - default volto style schema
  // - listing block -> default style schema enhancer
  // - listing block variation -> style schema enhancer
  // - listing block card/item extension -> style schema enhancer
  //
  // We omit the first step in ladder because of bugs in Volto < 16.0.0-alpha.36
  // In later versions we won't have to redefine the styles field

  const defaultStyleSchema = config.blocks.blocksConfig.listing.stylesSchema;

  if (schema.properties.styles) return schema;

  schema.fieldsets.push({
    id: 'styling',
    title: intl.formatMessage(messages.styling),
    fields: ['styles'],
  });

  schema.properties.styles = {
    widget: 'object',
    title: intl.formatMessage(messages.styling),
    schema: defaultStyleSchema({ formData, intl, schema }),
  };

  return schema;
};
export const enhanceStylingSchema = ({
  formData,
  schema,
  blockType = 'listing',
  extensionName = 'itemTemplates',
  intl,
}) => {
  // Adds (to the limited styles schema) the new styling schema enhancements
  schema = addStylesField({ formData, schema, intl });

  // first, enhance styling schema based on the variation
  // then, enhance it based on the `${extensionName}`

  const blockConfig = config.blocks.blocksConfig[blockType];
  const activeVariationId =
    formData['variation'] ||
    blockConfig.variations?.find(({ isDefault }) => isDefault)?.id;
  // TODO: use resolveExtensions() from Volto
  const activeVariation = activeVariationId
    ? blockConfig.variations.find(({ id }) => id === activeVariationId)
    : {};

  // TODO: not needed when we will use latest Volto
  const variationStyleSchema = activeVariation?.stylesSchema;
  if (variationStyleSchema) {
    schema.properties.styles.schema = variationStyleSchema({
      schema: cloneDeep(schema.properties.styles.schema),
      formData,
      intl,
    });
  }
  // end TODO

  const extensionType = '@type'; // the attribute name that's stored in the block data
  const extensionTemplates = blockConfig.extensions?.[extensionName];
  const activeItemName = formData?.itemModel?.[extensionType];
  let activeItem = extensionTemplates?.find(
    (item) => item.id === activeItemName,
  );

  const stylingSchema = activeItem?.['stylesSchema'];
  if (stylingSchema) {
    schema.properties.styles.schema = stylingSchema({
      schema: cloneDeep(schema.properties.styles.schema),
      formData,
      intl,
    });
  }

  return schema;
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
