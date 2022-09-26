import { defaultStyleSchema } from '@plone/volto/components/manage/Blocks/Block/StylesSchema';
import messages from '@eeacms/volto-listing-block/messages';

import alignLeftSVG from '@plone/volto/icons/align-left.svg';
import alignCenterSVG from '@plone/volto/icons/align-center.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

const ALIGN_VALUE_MAP = [
  ['align_left', alignLeftSVG],
  ['align_center', alignCenterSVG],
  ['', clearSVG],
];

export const ListingStylingSchemaEnhancer = ({ schema }) => {
  return schema;
};

export const BasicListingBlockStylesSchema = ({ intl, formData }) => {
  const styleSchema = defaultStyleSchema({ intl, formData });
  styleSchema.fieldsets[0].fields.push('theme', 'text_align');

  styleSchema.properties = {
    ...styleSchema.properties,
    theme: {
      title: intl.formatMessage(messages.Theme),
      description: intl.formatMessage(messages.ThemeHelp),
      choices: [
        ['', intl.formatMessage(messages.ThemeDefault)],
        ['primary', intl.formatMessage(messages.ThemePrimary)],
        ['secondary', intl.formatMessage(messages.ThemeSecondary)],
        ['tertiary', intl.formatMessage(messages.ThemeTertiary)],
      ],
    },
    text_align: {
      title: 'Text align',
      widget: 'style_text_align',
      actions: ALIGN_VALUE_MAP,
    },
  };

  return styleSchema;
};
