import { cloneDeep } from 'lodash';
import config from '@plone/volto/registry';
import messages from '@eeacms/volto-listing-block/messages';

export const addTypeSelect = ({
  formData,
  intl,
  schema,
  extensionName,
  messages,
}) => {
  schema = cloneDeep(schema);
  const field = '@type';
  const extensions = config.blocks.blocksConfig.listing.extensions;
  const variations = extensions[extensionName];
  const selectedVariation = formData?.variation || 'summary';
  const filteredVariations = variations.filter((entry) => {
    return entry.excludedFromVariations
      ? entry.excludedFromVariations.indexOf(selectedVariation) === -1
      : true;
  });
  schema.properties[field] = {
    title: intl.formatMessage(messages.title),
    choices: filteredVariations.map(({ id, title }) => [id, title]),
    default: filteredVariations.find(({ isDefault }) => isDefault).id,
  };
  schema.fieldsets[0].fields.unshift(field);

  return schema;
};

// Creates a factory that can trigger schemaEnhancer for a given extension
export const schemaEnhancerFactory =
  ({
    extensionName,
    messages,
    blockType = 'listing',
    extensionField = '@type',
  }) =>
  ({ schema: originalSchema, formData, intl }) => {
    //
    // the attribute name that's stored in the block data
    // it identifies the type of extension that's
    // applied. Similar in scope, for example, with the block @type

    const blockConfig = config.blocks.blocksConfig[blockType];
    const extensions = blockConfig.extensions;
    const templates = extensions[extensionName];

    const activeItemName = formData?.itemModel?.[extensionField]; // TODO: don't hardcode itemModel
    let activeItem = templates?.find((item) => item.id === activeItemName);
    if (!activeItem) activeItem = templates?.find((item) => item.isDefault);

    const schemaEnhancer = activeItem?.['schemaEnhancer'];

    let schema = schemaEnhancer
      ? schemaEnhancer({ schema: cloneDeep(originalSchema), formData, intl })
      : cloneDeep(originalSchema);

    return schema;
  };

export const DefaultCardModelSchema = {
  title: intl.formatMessage(messages.CardModel),
  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.Settings),
      fields: [],
    },
    {
      id: 'styling',
      title: intl.formatMessage(messages.Styling),
      fields: ['styles'],
    },
  ],
  properties: {
    styles: {
      widget: 'object',
      title: intl.formatMessage(messages.Cardstyling),
      schema: {
        title: intl.formatMessage(messages.CardStyling),
        fieldsets: [
          {
            id: 'default',
            title: intl.formatMessage(messages.Default),
            fields: [],
          },
        ],
        properties: {},
        required: [],
      },
    },
  },
  required: [],
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

export function composeSchema() {
  const enhancers = Array.from(arguments);
  const composer = (args) => {
    const props = enhancers.reduce(
      (acc, enhancer) => (enhancer ? { ...acc, schema: enhancer(acc) } : acc),
      { ...args },
    );
    return props.schema;
  };
  return composer;
}
