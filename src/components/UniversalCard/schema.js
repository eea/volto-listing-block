import { defineMessages } from 'react-intl';
import { enhanceSchema } from '@eeacms/volto-listing-block/schema-utils';

const messages = defineMessages({
  title: {
    id: 'Card type',
    defaultMessage: 'Card type',
  },
});

const CallToActionSchema = ({ formData }) => {
  return {
    fieldsets: [
      {
        id: 'default',
        fields: [
          'enable',
          ...(formData.itemModel?.callToAction?.enable
            ? [
                'label',
                formData['@type'] === 'listing' ? 'urlTemplate' : 'href',
              ]
            : []),
        ], //
        title: 'Default',
      },
    ],
    properties: {
      enable: {
        type: 'boolean',
        title: 'Show action',
      },
      label: {
        title: 'Action label',
        default: 'Read more',
        defaultValue: 'Read more',
      },
      href: {
        title: 'Action URL',
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      urlTemplate: {
        title: 'Action URL Template',
        description:
          'Enter a path. Available placeholders: $URL, $PORTAL_URL. If empty, the result URL will be used.',
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
          ...(formData?.itemModel?.hasDescription ? ['maxDescription'] : []),
          'hasMetaType',
          'hasLabel',
          'hasTags',
          'callToAction',
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

export default function universalCardSchemaEnhancer(props) {
  const { schema } = props;
  const enhancer = enhanceSchema({ extensionName: 'cardTemplates', messages });
  return {
    ...schema,
    fieldsets: [
      ...schema.fieldsets,
      {
        id: 'cardDesigner',
        title: 'Card',
        fields: ['itemModel'],
      },
    ],
    properties: {
      ...schema.properties,
      itemModel: {
        title: 'Card model',
        widget: 'object',
        schema: enhancer({
          ...props,
          schema: CardSchema(props),
        }),
      },
    },
  };
}
