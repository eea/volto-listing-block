import { defineMessages } from 'react-intl';

const messages = defineMessages({
  Type: {
    id: 'Listing',
    defaultMessage: 'Listing',
  },
  Theme: {
    id: 'Theme',
    defaultMessage: 'Theme',
  },
  ThemeHelp: {
    id: 'Theme',
    defaultMessage: 'Theme',
  },
  ThemeDefault: {
    id: 'Default',
    defaultMessage: 'Default',
  },
  ThemePrimary: {
    id: 'Primary',
    defaultMessage: 'Primary',
  },
  ThemeSecondary: {
    id: 'Secondary',
    defaultMessage: 'Secondary',
  },
  ThemeTertiary: {
    id: 'Tertiary',
    defaultMessage: 'Tertiary',
  },
  Rounded: {
    id: 'Rounded',
    defaultMessage: 'Rounded',
  },
  RoundedHelp: {
    id: 'Rounded Image',
    defaultMessage: 'Rounded Image',
  },
  Inverted: {
    id: 'Inverted',
    defaultMessage: 'Inverted',
  },
  InvertedHelp: {
    id: 'InvertedHelp',
    defaultMessage: 'Inverted theme',
  },
});

export const ListingStylingSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.Type),
  block: 'listing',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['theme', 'rounded', 'inverted'],
    },
  ],
  properties: {
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
    inverted: {
      title: intl.formatMessage(messages.Inverted),
      description: intl.formatMessage(messages.InvertedHelp),
      type: 'boolean',
    },
    rounded: {
      title: intl.formatMessage(messages.Rounded),
      description: intl.formatMessage(messages.RoundedHelp),
      type: 'boolean',
    },
  },
  required: [],
});
