import messages from '@eeacms/volto-listing-block/messages';
import config from '@plone/volto/registry';
import {
  CARD,
  ITEM,
  NO_HORIZONTAL_IMAGE_VARIATIONS,
} from '@eeacms/volto-listing-block/components/UniversalCard/migrate';
import { getElementsOrder } from '@eeacms/volto-listing-block/components/UniversalCard/elements';

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

const modelHasImage = (itemModel = {}) =>
  (itemModel['@type'] ?? CARD) === CARD
    ? itemModel.contentMode === 'overlay' ||
      itemModel.contentMode === 'logo' ||
      itemModel.imagePosition !== 'none'
    : !!itemModel.imagePosition && itemModel.imagePosition !== 'none';

const getImagePositionChoices = ({ template, variation, intl, current }) => {
  const choices = [
    ...(template === CARD
      ? [
          // above or below the text, placed with the elements order
          ['top', intl.formatMessage(messages.imagePositionVertical)],
          // superseded by the elements order, kept for existing data
          ...(current === 'bottom'
            ? [['bottom', intl.formatMessage(messages.imagePositionBottom)]]
            : []),
        ]
      : []),
    ['left', intl.formatMessage(messages.left)],
    ['right', intl.formatMessage(messages.right)],
    ['none', intl.formatMessage(messages.imagePositionNone)],
  ];

  // horizontal cards don't fit in carousels and grids; for list items the
  // side image is part of the row, so they keep it everywhere
  return template === CARD && NO_HORIZONTAL_IMAGE_VARIATIONS.includes(variation)
    ? choices.filter(([value]) => value !== 'left' && value !== 'right')
    : choices;
};

const getElementLabels = (intl) => ({
  image: intl.formatMessage(messages.image),
  contentType: intl.formatMessage(messages.elementContentType),
  date: intl.formatMessage(messages.elementDate),
  title: intl.formatMessage(messages.elementTitle),
  benchmark: intl.formatMessage(messages.elementBenchmark),
  description: intl.formatMessage(messages.description),
  tags: intl.formatMessage(messages.elementTags),
  cta: intl.formatMessage(messages.elementCallToAction),
});

const booleanToggle = (field, defaultVisible) => ({
  field,
  on: true,
  off: false,
  defaultVisible,
});

/**
 * What each element row of the card elements widget offers: a visibility
 * toggle and the settings shown when the row is expanded.
 */
const getElementSettings = (itemModel, template, blockType) => ({
  image: {
    toggle: { field: 'imagePosition', on: 'top', off: 'none' },
    fields: ['titleOnImage', 'hasLabel'],
  },
  contentType: { toggle: booleanToggle('hasMetaType', false) },
  date: {
    toggle: booleanToggle('hasDate', true),
    fields: ['hasEventDate'],
  },
  title: {
    fields: ['maxTitle', 'hasIcon', ...(itemModel.hasIcon ? ['icon'] : [])],
  },
  benchmark: { toggle: booleanToggle('hasBenchmarkLevel', false) },
  description: {
    toggle: booleanToggle('hasDescription', template === ITEM),
    fields: ['maxDescription'],
  },
  tags: { toggle: booleanToggle('hasTags', false) },
  cta: {
    // the settings of the call to action are nested in `callToAction`
    toggle: {
      field: 'callToAction',
      key: 'enable',
      on: true,
      off: false,
      defaultVisible: false,
    },
    fields: [
      { field: 'callToAction', key: 'label' },
      {
        field: 'callToAction',
        key: blockType === 'listing' ? 'urlTemplate' : 'href',
      },
      'enableCTAPopup',
    ],
  },
});

const getFieldKey = (spec) =>
  typeof spec === 'string' ? spec : `${spec.field}.${spec.key}`;

const getFieldSchema = (properties, spec) =>
  typeof spec === 'string'
    ? properties[spec]
    : properties[spec.field]?.schema?.properties?.[spec.key];

// Built last, from the final properties, so the rows reuse their schemas
const addElementsProperty = ({
  properties,
  itemModel,
  template,
  blockType,
  intl,
}) => {
  const labels = getElementLabels(intl);
  const model = { ...itemModel, '@type': template };
  const order = getElementsOrder(model);
  const elementSettings = getElementSettings(model, template, blockType);
  const fieldSchemas = Object.fromEntries(
    Object.values(elementSettings)
      .flatMap(({ fields = [] }) => fields)
      .map((spec) => [getFieldKey(spec), getFieldSchema(properties, spec)]),
  );

  return {
    ...properties,
    elementsOrder: {
      title: intl.formatMessage(messages.elementsOrder),
      description: intl.formatMessage(messages.elementsOrderHelp),
      widget: 'card_elements',
      elements: order.map((id) => [id, labels[id]]),
      elementSettings: Object.fromEntries(
        order.map((id) => [id, elementSettings[id]]),
      ),
      fieldSchemas,
      default: itemModel.elementsOrder ?? order,
    },
  };
};

// Use the current (possibly migrated) value as default, so the form stores
// what is actually rendered for legacy data that lacks these fields.
const applyModelDefaults = (properties, itemModel = {}) =>
  Object.keys(properties).reduce((acc, key) => {
    const property = properties[key];
    acc[key] =
      property.widget !== 'object' && itemModel[key] !== undefined
        ? { ...property, default: itemModel[key] }
        : property;
    return acc;
  }, {});

const commonModelProperties = ({ formData, intl }) => ({
  maxTitle: {
    title: intl.formatMessage(messages.maxTitle),
    description: intl.formatMessage(messages.maxTitleDescription),
    type: 'number',
    default: 2,
    minimum: 0,
    maximum: 5,
  },
  hasDate: {
    title: intl.formatMessage(messages.publicationDate),
    type: 'boolean',
    // shown by default (Taskman #307509)
    default: true,
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
  hasIcon: {
    title: intl.formatMessage(messages.iconLabel),
    type: 'boolean',
    default: false,
  },
  icon: {
    title: intl.formatMessage(messages.icon),
    description: intl.formatMessage(messages.iconExample),
  },
  callToAction: {
    widget: 'object',
    schema: CallToActionSchema({ formData, intl }),
  },
  enableCTAPopup: {
    title: intl.formatMessage(messages.enableCTAPopup),
    description: intl.formatMessage(messages.enableCTAPopupDescription),
    type: 'boolean',
    default: false,
  },
});

export const setCardModelSchema = (args) => {
  const { formData, schema, intl } = args;
  const itemModel = formData?.itemModel || {};
  const variation = formData?.variation || 'summary';
  const isOverlay = itemModel.contentMode === 'overlay';
  const isLogo = itemModel.contentMode === 'logo';
  // the title and logo card is made for teasers; kept where already used
  const offersLogo = formData?.['@type'] === 'teaser' || isLogo;
  const hasImage = modelHasImage({ ...itemModel, '@type': CARD });
  // side images are not part of the elements list, keep their settings here
  const hasSideImage =
    itemModel.imagePosition === 'left' || itemModel.imagePosition === 'right';

  const itemModelSchema = schema.properties.itemModel.schema;
  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'contentMode',
    ...(isOverlay
      ? ['titleOnImage', 'hasLabel']
      : isLogo
        ? [
            'maxTitle',
            'hasTags',
            'callToAction',
            ...(itemModel.callToAction?.enable ? ['enableCTAPopup'] : []),
          ]
        : [
            'imagePosition',
            'elementsOrder',
            ...(hasSideImage && hasImage ? ['titleOnImage', 'hasLabel'] : []),
          ]),
  ];
  const properties = applyModelDefaults(
    {
      ...itemModelSchema.properties,
      ...commonModelProperties({ formData, intl }),
      contentMode: {
        title: intl.formatMessage(messages.contentMode),
        choices: [
          ['default', intl.formatMessage(messages.contentModeDefault)],
          ['overlay', intl.formatMessage(messages.contentModeOverlay)],
          ...(offersLogo
            ? [['logo', intl.formatMessage(messages.contentModeLogo)]]
            : []),
        ],
        default: 'default',
      },
      imagePosition: {
        title: intl.formatMessage(messages.imagePosition),
        choices: getImagePositionChoices({
          template: CARD,
          variation,
          intl,
          current: itemModel.imagePosition,
        }),
        default: 'top',
      },
      titleOnImage: {
        title: intl.formatMessage(messages.displayTitle),
        type: 'boolean',
        default: false,
      },
      hasBenchmarkLevel: {
        title: intl.formatMessage(messages.showBenchmarkLevel),
        type: 'boolean',
        default: false,
      },
    },
    itemModel,
  );
  itemModelSchema.properties = addElementsProperty({
    properties,
    itemModel,
    template: CARD,
    blockType: formData?.['@type'],
    intl,
  });
  return schema;
};

// List items have a fixed order of their elements, so they get plain
// options instead of the card elements widget. The compact size (the former
// simple item) shows only the title and the content type.
const getItemFields = (itemModel, hasImage) =>
  itemModel.size === 'compact'
    ? ['maxTitle', 'hasMetaType']
    : [
        'imagePosition',
        'maxTitle',
        'hasIcon',
        ...(itemModel.hasIcon ? ['icon'] : []),
        'hasDate',
        'hasEventDate',
        'hasDescription',
        ...(itemModel.hasDescription ? ['maxDescription'] : []),
        'hasMetaType',
        ...(hasImage ? ['hasLabel'] : []),
        'hasTags',
        'callToAction',
        ...(itemModel.callToAction?.enable ? ['enableCTAPopup'] : []),
      ];

export const setItemModelSchema = (args) => {
  const { formData, schema, intl } = args;
  const itemModel = formData?.itemModel || {};
  const variation = formData?.variation || 'summary';
  const hasImage = modelHasImage({ ...itemModel, '@type': ITEM });

  const itemModelSchema = schema.properties.itemModel.schema;
  itemModelSchema.fieldsets[0].fields = [
    ...itemModelSchema.fieldsets[0].fields,
    'size',
    ...getItemFields(itemModel, hasImage),
  ];
  const common = commonModelProperties({ formData, intl });
  itemModelSchema.properties = applyModelDefaults(
    {
      ...itemModelSchema.properties,
      ...common,
      imagePosition: {
        title: intl.formatMessage(messages.imagePosition),
        choices: getImagePositionChoices({ template: ITEM, variation, intl }),
        default: 'left',
      },
      size: {
        title: intl.formatMessage(messages.size),
        choices: [
          ['default', intl.formatMessage(messages.sizeDefault)],
          ['compact', intl.formatMessage(messages.sizeCompact)],
        ],
        default: 'default',
      },
      hasDescription: { ...common.hasDescription, default: true },
    },
    itemModel,
  );
  return schema;
};

export const setCardStylingSchema = ({ schema, formData, intl }) => {
  // populate the 'styling' fieldset of the cards and list items
  const itemModelSchema = schema.properties.itemModel;
  const styleSchema = itemModelSchema.schema.properties.styles.schema;
  const fieldset = styleSchema.fieldsets.find(({ id }) => id === 'default');
  const itemModel = formData?.itemModel || {};
  const isCard = (itemModel['@type'] ?? CARD) === CARD;
  // the compact item has no image
  const hasImage =
    !(!isCard && itemModel.size === 'compact') && modelHasImage(itemModel);
  fieldset.fields.push(
    'theme:noprefix',
    'inverted:bool',
    'bordered:bool',
    ...(isCard ? ['topAccent:bool'] : []),
    // image options only when there is an image
    ...(hasImage ? ['rounded:bool'] : []),
    'text',
    ...(hasImage ? ['objectFit', 'objectPosition'] : []),
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
    'bordered:bool': {
      title: intl.formatMessage(messages.Bordered),
      type: 'boolean',
    },
    'topAccent:bool': {
      title: intl.formatMessage(messages.topAccent),
      description: intl.formatMessage(messages.topAccentHelp),
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
