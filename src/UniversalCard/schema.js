const CallToActionSchema = ({ formData }) => {
  return {
    fieldsets: [
      {
        id: 'default',
        fields: [
          'enable',
          ...(formData.cardModel?.callToAction?.enable
            ? ['label', 'href', 'urlTemplate']
            : []),
        ], //
        title: 'Default',
      },
    ],
    properties: {
      enable: {
        type: 'boolean',
        title: 'Show call to action',
      },
      label: {
        title: 'Label',
      },
      href: {
        title: 'Internal URL',
        description: 'For listings, use the URL Template field',
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      urlTemplate: {
        title: 'URL Template',
        description: 'Enter a path. Available placeholders: $URL, $PORTAL_URL',
      },
    },
    required: [],
  };
};

const CardSchema = ({ formData }) => {
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
          'hasTags',
          'callToAction',
        ],
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
        title: 'Show new/archived label',
        type: 'boolean',
      },
      hasTags: {
        title: 'Show tags',
        type: 'boolean',
      },
      callToAction: {
        widget: 'object',
        schema: CallToActionSchema({ formData }),
      },
    },
    required: [],
  };
};

export default function universalCardSchemaEnhancer({ schema, ...rest }) {
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
        schema: CardSchema({ ...rest }),
      },
    },
  };
}
