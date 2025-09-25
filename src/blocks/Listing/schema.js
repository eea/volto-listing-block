import messages from '@eeacms/volto-listing-block/messages';
import config from '@plone/volto/registry';

import alignLeftSVG from '@plone/volto/icons/align-left.svg';
import alignCenterSVG from '@plone/volto/icons/align-center.svg';

const ALIGN_INFO_MAP = (intl) => ({
  left: [alignLeftSVG, intl.formatMessage(messages.left)],
  center: [alignCenterSVG, intl.formatMessage(messages.center)],
});

const CallToActionSchema = ({ formData, intl }) => {
  return {
    fieldsets: [
      {
        id: 'default',
        fields: [
          'enable',
          ...(formData?.itemModel?.callToAction?.enable
            ? [
                'label',
                formData?.['@type'] === 'listing' ? 'urlTemplate' : 'href',
              ]
            : []),
        ],
        title: intl.formatMessage(messages.defaultLabel),
      },
    ],
    properties: {
      enable: {
        type: 'boolean',
        title: intl.formatMessage(messages.showAction),
      },
      label: {
        title: intl.formatMessage(messages.actionLabel),
        default: 'Read more',
        defaultValue: 'Read more',
      },
      href: {
        title: intl.formatMessage(messages.actionURL),
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      urlTemplate: {
        title: intl.formatMessage(messages.actionURLTemplate),
        description: intl.formatMessage(messages.urlTemplateDescription),
      },
    },
    required: [],
  };
};

const CallToActionVisualizationSchema = ({ formData }) => {
  return {
    fieldsets: [
      {
        id: 'default',
        fields: [
          'enable',
          ...(formData?.itemModel?.callToAction?.enable
            ? ['label', 'urlTemplate']
            : []),
        ],
        title: 'Default',
      },
    ],
    properties: {
      enable: {
        type: 'boolean',
        title: 'Show action',
        default: true,
      },
      label: {
        title: 'Action label',
        default: 'More info',
      },
      urlTemplate: {
        title: 'Action URL Template',
        description:
          'Enter a path. Available placeholders: $URL, $PORTAL_URL. If empty, the result URL will be used.',
        default: '$URL',
      },
    },
    required: [],
  };
};

export const setCardModelSchema = (args) => {
  const { formData, schema, intl } = args;

  const itemModelSchema = schema.properties.itemModel.schema;
  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'hasLink',
    'titleOnImage',
    'maxTitle',
    'hasDate',
    'hasEventDate',
    'hasDescription',
    ...(formData?.itemModel?.hasDescription ? ['maxDescription'] : []),
    'hasMetaType',
    'hasLabel',
    'hasTags',
    'callToAction',
  ];
  itemModelSchema.properties = {
    ...itemModelSchema.properties,
    titleOnImage: {
      title: intl.formatMessage(messages.displayTitle),
      type: 'boolean',
      default: false,
    },
    hasLink: {
      title: intl.formatMessage(messages.enableLink),
      description: intl.formatMessage(messages.enableLinkDescription),
      type: 'boolean',
      default: true,
    },
    hasDate: {
      title: intl.formatMessage(messages.publicationDate),
      type: 'boolean',
      default: false,
    },
    hasEventDate: {
      title: intl.formatMessage(messages.eventDate),
      type: 'boolean',
      default: false,
    },
    hasDescription: {
      title: intl.formatMessage(messages.description),
      type: 'boolean',
    },
    maxTitle: {
      title: intl.formatMessage(messages.maxTitle),
      description: intl.formatMessage(messages.maxTitleDescription),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    maxDescription: {
      title: intl.formatMessage(messages.maxDescriptionTitle),
      description: intl.formatMessage(messages.maxDescriptionTitleDescription),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    hasMetaType: {
      title: intl.formatMessage(messages.showPortalType),
      type: 'boolean',
    },
    hasLabel: {
      title: intl.formatMessage(messages.showNewArchivedLabel),
      type: 'boolean',
    },
    hasTags: {
      title: intl.formatMessage(messages.showTags),
      type: 'boolean',
    },
    callToAction: {
      widget: 'object',
      schema: CallToActionSchema({ formData, intl }),
    },
  };
  return schema;
};

export const setVisualizationCardModelSchema = (args) => {
  const { formData, schema } = args;

  const itemModelSchema = schema.properties.itemModel.schema;
  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'maxTitle',
    'hasDescription',
    'maxDescription',
    'callToAction',
    ...(formData?.itemModel?.callToAction?.enable ? ['enableCTAPopup'] : []),
  ];
  itemModelSchema.properties = {
    ...itemModelSchema.properties,
    hasDescription: {
      title: 'Description',
      type: 'boolean',
      default: false,
    },
    callToAction: {
      widget: 'object',
      schema: CallToActionVisualizationSchema({ formData }),
    },

    maxTitle: {
      title: 'Title max lines',
      description:
        "Limit title to a maximum number of lines by adding trailing '...'",
      type: 'number',
      default: 4,
      minimum: 0,
      maximum: 5,
    },
    maxDescription: {
      title: 'Description max lines',
      description:
        "Limit description to a maximum number of lines by adding trailing '...'",
      type: 'number',
      default: 4,
      minimum: 0,
      maximum: 5,
    },
    enableCTAPopup: {
      title: 'Enable CTA content popup',
      description: 'Will enable the CTA content popup only from 1280px and up',
      type: 'boolean',
      default: true,
    },
  };
  return schema;
};

export const setItemModelSchema = (args) => {
  const { formData, schema, intl } = args;

  const itemModelSchema = schema.properties.itemModel.schema;

  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'maxTitle',
    'hasDate',
    'hasEventDate',
    'hasDescription',
    'maxDescription',
    'hasImage',
    ...(formData.itemModel?.hasImage ? ['imageOnRightSide'] : []),
    'hasIcon',
    ...(formData.itemModel?.hasIcon ? ['icon'] : []),
    // 'hasMetaType',
    // 'hasLabel',
    // 'hasTags',
    // 'callToAction',
  ];
  itemModelSchema.properties = {
    ...itemModelSchema.properties,

    hasDate: {
      title: intl.formatMessage(messages.publicationDate),
      type: 'boolean',
    },
    hasEventDate: {
      title: intl.formatMessage(messages.eventDate),
      type: 'boolean',
      default: false,
    },
    hasDescription: {
      title: intl.formatMessage(messages.description),
      type: 'boolean',
      default: true,
    },
    maxTitle: {
      title: intl.formatMessage(messages.maxTitle),
      description: intl.formatMessage(messages.maxTitleDescription),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    maxDescription: {
      title: intl.formatMessage(messages.maxDescriptionTitle),
      description: intl.formatMessage(messages.maxDescriptionTitleDescription),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    hasImage: {
      title: intl.formatMessage(messages.image),
      type: 'boolean',
      default: true,
    },
    hasIcon: {
      title: intl.formatMessage(messages.iconLabel),
      type: 'boolean',
      default: false,
    },
    icon: {
      title: intl.formatMessage(messages.icon),
      description: intl.formatMessage(messages.imageRight),
    },
    imageOnRightSide: {
      title: intl.formatMessage(messages.imageLeft),
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
  };
  return schema;
};

export const setSimpleItemModelSchema = (args) => {
  const { schema, intl } = args;
  const itemModelSchema = schema.properties.itemModel.schema;

  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'maxTitle',
    'hasMetaType',
  ];
  itemModelSchema.properties = {
    ...itemModelSchema.properties,
    maxTitle: {
      title: intl.formatMessage(messages.maxTitle),
      description: intl.formatMessage(messages.maxTitleDescription),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    hasMetaType: {
      title: intl.formatMessage(messages.showPortalType),
      type: 'boolean',
    },
  };
  return schema;
};

export const setSimpleItemStylingSchema = ({ schema, intl }) => {
  // populate the 'styling' fieldset of the cards
  const itemModelSchema = schema.properties.itemModel;
  const styleSchema = itemModelSchema.schema.properties.styles.schema;
  const fieldset = styleSchema.fieldsets.find(({ id }) => id === 'default');
  fieldset.fields.push(
    'theme:noprefix',
    'inverted:bool',
    'bordered:bool',
    'text',
  );
  styleSchema.properties = {
    ...styleSchema.properties,
    'theme:noprefix': {
      title: intl.formatMessage(messages.Theme),
      description: intl.formatMessage(messages.ThemeHelp),
      widget: 'theme_picker',
      colors: [
        ...(config.settings && config.settings.themeColors
          ? config.settings.themeColors.map(({ value, title }) => ({
              name: value,
              label: title,
            }))
          : []),
        //and add extra ones here
      ],
    },
    'inverted:bool': {
      title: intl.formatMessage(messages.Inverted),
      description: intl.formatMessage(messages.InvertedHelp),
      type: 'boolean',
    },
    'bordered:bool': {
      title: intl.formatMessage(messages.Bordered),
      type: 'boolean',
    },
    text: {
      title: intl.formatMessage(messages.textAlign),
      widget: 'style_text_align',
      actions: Object.keys(ALIGN_INFO_MAP(intl)),
      actionsInfoMap: ALIGN_INFO_MAP(intl),
    },
  };

  return schema;
};

export const setCardStylingSchema = ({ schema, intl }) => {
  // populate the 'styling' fieldset of the cards
  const itemModelSchema = schema.properties.itemModel;
  const styleSchema = itemModelSchema.schema.properties.styles.schema;
  const fieldset = styleSchema.fieldsets.find(({ id }) => id === 'default');
  fieldset.fields.push(
    'theme:noprefix',
    'inverted:bool',
    'rounded:bool',
    'text',
    'objectFit',
    'objectPosition',
  );
  styleSchema.properties = {
    ...styleSchema.properties,
    'theme:noprefix': {
      title: intl.formatMessage(messages.Theme),
      description: intl.formatMessage(messages.ThemeHelp),
      widget: 'theme_picker',
      colors: [
        ...(config.settings && config.settings.themeColors
          ? config.settings.themeColors.map(({ value, title }) => ({
              name: value,
              label: title,
            }))
          : []),
        //and add extra ones here
      ],
    },
    'inverted:bool': {
      title: intl.formatMessage(messages.Inverted),
      description: intl.formatMessage(messages.InvertedHelp),
      type: 'boolean',
    },
    'rounded:bool': {
      title: intl.formatMessage(messages.Rounded),
      description: intl.formatMessage(messages.RoundedHelp),
      type: 'boolean',
    },
    text: {
      title: intl.formatMessage(messages.textAlign),
      widget: 'style_text_align',
      actions: Object.keys(ALIGN_INFO_MAP(intl)),
      actionsInfoMap: ALIGN_INFO_MAP(intl),
    },
    objectFit: {
      title: intl.formatMessage(messages.ObjectFit),
      description: intl.formatMessage(messages.ObjectFitHelp),
      choices: [
        ['cover', intl.formatMessage(messages.cover)],
        ['contain', intl.formatMessage(messages.contain)],
        ['fill', intl.formatMessage(messages.fill)],
        ['scale-down', intl.formatMessage(messages.scaleDown)],
        ['none', intl.formatMessage(messages.none)],
      ],
    },
    objectPosition: {
      title: intl.formatMessage(messages.ObjectPosition),
      description: intl.formatMessage(messages.ObjectPositionHelp),
      choices: [
        ['top', intl.formatMessage(messages.top)],
        ['bottom', intl.formatMessage(messages.bottom)],
        ['left', intl.formatMessage(messages.left)],
        ['right', intl.formatMessage(messages.right)],
        ['center', intl.formatMessage(messages.center)],
      ],
    },
  };

  return schema;
};
