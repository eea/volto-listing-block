import { enhanceSchema } from './utils';

const ItemSchema = ({ formData }) => {
  return {
    fieldsets: [
      {
        id: 'cardDesigner',
        title: 'Card',
        fields: [
          'hasDate',
          'hasDescription',
          'maxDescription',
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
        schema: enhanceSchema({ ...props, schema: ItemSchema(props) }),
      },
    },
  };
}
