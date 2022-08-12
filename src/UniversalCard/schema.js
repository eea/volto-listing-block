const CardSchema = () => {
  return {
    fieldsets: [
      {
        id: 'cardDesigner',
        title: 'Card',
        fields: [
          'hasDate',
          'hasDescription',
          'maxDescription',
          'hasMetaType',
          'hasLabel',
        ], // 'cardModel'
      },
    ],
    properties: {
      cardModel: {
        title: 'Card model',
      },
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
      hasMetaType: {
        title: 'Show portal type',
        type: 'boolean',
      },
      hasLabel: {
        title: 'Show label',
        type: 'boolean',
      },
    },
    required: [],
  };
};

export default function ({ schema }) {
  return {
    ...schema,
    fieldsets: [
      ...schema.fieldsets,
      {
        id: 'cardDesigner',
        title: 'Card',
        fields: ['cardModel'],
      },
    ],
    properties: {
      ...schema.properties,
      cardModel: {
        title: 'Card model',
        widget: 'object',
        schema: CardSchema(),
      },
    },
  };
}
