import messages from '@eeacms/volto-listing-block/messages';
import config from '@plone/volto/registry';

import alignLeftSVG from '@plone/volto/icons/align-left.svg';
import alignCenterSVG from '@plone/volto/icons/align-center.svg';

const ALIGN_INFO_MAP = {
  left: [alignLeftSVG, 'Left'],
  center: [alignCenterSVG, 'Center'],
};

const CallToActionSchema = ({ formData }) => {
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
        title: intl.formatMessage(messages.Default),
      },
    ],
    properties: {
      enable: {
        type: 'boolean',
        title: intl.formatMessage(messages.ShowAction),
      },
      label: {
        title: intl.formatMessage(messages.ActionLabel),
        default: 'Read more',
        defaultValue: 'Read more',
      },
      href: {
        title: intl.formatMessage(messages.ActionURL),
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      urlTemplate: {
        title: intl.formatMessage(messages.ActionURLTemplate),
        description: intl.formatMessage(messages.ActionURLTemplateHelp),
      },
    },
    required: [],
  };
};

export const setCardModelSchema = (args) => {
  const { formData, schema } = args;

  const itemModelSchema = schema.properties.itemModel.schema;
  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'hasLink',
    'titleOnImage',
    'maxTitle',
    'hasDate',
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
      title: intl.formatMessage(messages.DisplayTitleOnImage),
      type: 'boolean',
      default: false,
    },
    hasLink: {
      title: intl.formatMessage(messages.EnableLink),
      description: 'Link to source content',
      type: 'boolean',
      default: true,
    },
    hasDate: {
      title: intl.formatMessage(messages.PublicationDate),
      type: 'boolean',
      default: false,
    },
    hasDescription: {
      title: intl.formatMessage(messages.Description),
      type: 'boolean',
    },
    maxTitle: {
      title: intl.formatMessage(messages.TitleMaxLines),
      description: intl.formatMessage(messages.TitleMaxLinesHelp),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    maxDescription: {
      title: intl.formatMessage(messages.DescriptionMaxLines),
      description: intl.formatMessage(messages.DescriptionMaxLinesHelp),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    hasMetaType: {
      title: intl.formatMessage(messages.HasMetaType),
      type: 'boolean',
    },
    hasLabel: {
      title: intl.formatMessage(messages.HasLabel),
      type: 'boolean',
    },
    hasTags: {
      title: intl.formatMessage(messages.HasTags),
      type: 'boolean',
    },
    callToAction: {
      widget: 'object',
      schema: CallToActionSchema({ formData }),
    },
  };
  return schema;
};

export const setItemModelSchema = (args) => {
  const { formData, schema } = args;
  const itemModelSchema = schema.properties.itemModel.schema;

  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'maxTitle',
    'hasDate',
    'hasDescription',
    'maxDescription',
    'hasImage',
    ...(formData.itemModel?.hasImage ? ['imageOnRightSide'] : []),
    // 'hasMetaType',
    // 'hasLabel',
    // 'hasTags',
    // 'callToAction',
  ];
  itemModelSchema.properties = {
    ...itemModelSchema.properties,

    hasDate: {
      title: intl.formatMessage(messages.PublicationDate),
      type: 'boolean',
    },
    hasDescription: {
      title: intl.formatMessage(messages.Description),
      type: 'boolean',
      default: true,
    },
    maxTitle: {
      title: intl.formatMessage(messages.TitleMaxLines),
      description: intl.formatMessage(messages.TitleMaxLinesHelp),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    maxDescription: {
      title: intl.formatMessage(messages.DescriptionMaxLines),
      description: intl.formatMessage(messages.DescriptionMaxLinesHelp),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
    },
    hasImage: {
      title: intl.formatMessage(messages.Image),
      type: 'boolean',
      default: true,
    },
    imageOnRightSide: {
      title: intl.formatMessage(messages.ImageOnRightSide),
      type: 'boolean',
    },
    // hasMetaType: {
    //   title: intl.formatMessage(messages.HasMetaType),
    //   type: 'boolean',
    // },
    // hasLabel: {
    //   title: intl.formatMessage(messages.HasLabel),
    //   type: 'boolean',
    // },
    // hasTags: {
    //   title: intl.formatMessage(messages.HasTags),
    //   type: 'boolean',
    // },
  };
  return schema;
};

export const setSimpleItemModelSchema = (args) => {
  const { schema } = args;
  const itemModelSchema = schema.properties.itemModel.schema;

  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'maxTitle',
  ];
  itemModelSchema.properties = {
    ...itemModelSchema.properties,
    maxTitle: {
      title: intl.formatMessage(messages.TitleMaxLines),
      description: intl.formatMessage(messages.TitleMaxLinesHelp),
      type: 'number',
      default: 2,
      minimum: 0,
      maximum: 5,
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
      title: intl.formatMessage(messages.TextAlign),
      widget: 'style_text_align',
      actions: Object.keys(ALIGN_INFO_MAP),
      actionsInfoMap: ALIGN_INFO_MAP,
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
      title: intl.formatMessage(messages.TextAlign),
      widget: 'style_text_align',
      actions: Object.keys(ALIGN_INFO_MAP),
      actionsInfoMap: ALIGN_INFO_MAP,
    },
    objectFit: {
      title: intl.formatMessage(messages.ObjectFit),
      description: intl.formatMessage(messages.ObjectFitHelp),
      choices: [
        ['cover', 'cover'],
        ['contain', 'contain'],
        ['fill', 'fill'],
        ['scale-down', 'scale-down'],
        ['none', 'none'],
      ],
    },
    objectPosition: {
      title: intl.formatMessage(messages.ObjectPosition),
      description: intl.formatMessage(messages.ObjectPositionHelp),
      choices: [
        ['top', 'top'],
        ['bottom', 'bottom'],
        ['left', 'left'],
        ['right', 'right'],
        ['center', 'center'],
      ],
    },
  };

  return schema;
};
