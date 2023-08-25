import config from '@plone/volto/registry';
import messages from '@eeacms/volto-listing-block/messages';

export default ({ data }) => {
  const { assetType = 'image' } = data;
  return {
    title: intl.formatMessage(messages.Item),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.Default),
        fields: ['assetType', 'theme', 'verticalAlign'],
      },
      ...(assetType === 'image'
        ? [
            {
              id: 'image',
              title: intl.formatMessage(messages.Image),
              fields: ['image', 'imageSize'],
            },
          ]
        : []),
      ...(assetType === 'icon'
        ? [
            {
              id: 'icon',
              title: intl.formatMessage(messages.Icon),
              fields: ['icon', 'iconSize'],
            },
          ]
        : []),
    ],
    properties: {
      assetType: {
        title: intl.formatMessage(messages.AssetType),
        choices: [
          ['image', intl.formatMessage(messages.Image)],
          ['icon', intl.formatMessage(messages.Icon)],
        ],
        default: 'image',
      },
      image: {
        title: intl.formatMessage(messages.Image),
        widget: 'attachedimage',
      },
      imageSize: {
        title: intl.formatMessage(messages.ImageSize),
        choices: [
          ['tiny', intl.formatMessage(messages.Tiny)],
          ['small', intl.formatMessage(messages.Small)],
          ['medium', intl.formatMessage(messages.Medium)],
          ['big', intl.formatMessage(messages.Large)],
          ['preview', intl.formatMessage(messages.Preview)],
        ],
        default: 'big',
      },
      icon: {
        title: intl.formatMessage(messages.IconName),
        description: (
          <>
            <FormattedMessage id="See" defaultMessage="See" />{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://remixicon.com"
            >
              <FormattedMessage
                id="Remix icon cheatsheet"
                defaultMessage="Remix icon cheatsheet"
              />
            </a>
          </>
        ),
      },
      iconSize: {
        title: intl.formatMessage(messages.IconSize),
        choices: [
          ['tiny', intl.formatMessage(messages.Tiny)],
          ['small', intl.formatMessage(messages.Small)],
          ['medium', intl.formatMessage(messages.Medium)],
          ['big', intl.formatMessage(messages.Large)],
        ],
        default: 'big',
      },
      theme: {
        title: intl.formatMessage(messages.ItemTheme),
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
      verticalAlign: {
        title: intl.formatMessage(messages.VerticalAlign),
        choices: [
          ['top', intl.formatMessage(messages.Top)],
          ['middle', intl.formatMessage(messages.Middle)],
          ['bottom', intl.formatMessage(messages.Bottom)],
        ],
        default: 'middle',
      },
    },
    required: [],
  };
};
