import { enhanceSchema } from '@eeacms/volto-listing-block/schema-utils';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'Item type',
    defaultMessage: 'Item type',
  },
});

const ItemSchema = ({ formData }) => {
  return {
    fieldsets: [
      {
        id: 'itemDesigner',
        title: 'Item',
        fields: [
          'hasDate',
          'hasDescription',
          'maxDescription',
          'hasImage',
          ...(formData.itemModel?.hasImage ? ['imageOnRightSide'] : []),
          // 'hasMetaType',
          // 'hasLabel',
          // 'hasTags',
          // 'callToAction',
        ],
      },
    ],
    properties: {
      hasDate: {
        title: 'Publication date',
        type: 'boolean',
      },
      hasDescription: {
        title: 'Description',
        type: 'boolean',
        default: true,
      },
      maxDescription: {
        title: 'Description max lines',
        description:
          "Limit description to a maximum number of lines by adding trailing '...'",
        type: 'number',
        default: 2,
        minimum: 0,
        maximum: 5,
      },
      hasImage: {
        title: 'Image',
        type: 'boolean',
        default: true,
      },
      imageOnRightSide: {
        title: 'Image on Right (Default is Left)',
        type: 'boolean',
      },
      // hasMetaType: {
      //   title: 'Show portal type',
      //   type: 'boolean',
      // },
      // hasLabel: {
      //   title: 'Show new/archived label',
      //   type: 'boolean',
      // },
      // hasTags: {
      //   title: 'Show tags',
      //   type: 'boolean',
      // },
    },
    required: [],
  };
};

export default function universalItemSchemaEnhancer(props) {
  const { schema } = props;
  const enhancer = enhanceSchema({ extensionName: 'itemTemplates', messages });
  return {
    ...schema,
    fieldsets: [
      ...schema.fieldsets,
      {
        id: 'itemDesigner',
        title: 'Item',
        fields: ['itemModel'],
      },
    ],
    properties: {
      ...schema.properties,
      itemModel: {
        title: 'Item model',
        widget: 'object',
        schema: enhancer({
          ...props,
          schema: ItemSchema(props),
        }),
      },
    },
  };
}
