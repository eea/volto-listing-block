import config from '@plone/volto/registry';

const ItemBlockSchema = ({ data }) => {
  const { assetType = 'image' } = data;
  return {
    title: 'Item',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['assetType', 'theme', 'verticalAlign'],
      },
      ...(assetType === 'image'
        ? [{ id: 'image', title: 'Image', fields: ['image', 'imageSize'] }]
        : []),
      ...(assetType === 'icon'
        ? [
            {
              id: 'icon',
              title: 'Icon',
              fields: ['icon', 'iconSize'],
            },
          ]
        : []),
    ],
    properties: {
      assetType: {
        title: 'Asset type',
        choices: [
          ['image', 'Image'],
          ['icon', 'Icon'],
        ],
        default: 'image',
      },
      image: {
        title: 'Image',
        widget: 'attachedimage',
      },
      imageSize: {
        title: 'Image size',
        choices: [
          ['tiny', 'Tiny'],
          ['small', 'Small'],
          ['medium', 'Medium'],
          ['big', 'Large'],
          ['preview', 'Preview'],
        ],
        default: 'big',
      },
      icon: {
        title: 'Icon name',
        description: (
          <>
            See{' '}
            <a
              target="_blank"
              rel="noopener"
              href="https://remixicon.com"
            >
              Remix icon cheatsheet
            </a>
          </>
        ),
      },
      iconSize: {
        title: 'Icon size',
        choices: [
          ['tiny', 'Tiny'],
          ['small', 'Small'],
          ['medium', 'Medium'],
          ['big', 'Large'],
        ],
        default: 'big',
      },
      theme: {
        title: 'Item theme',
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
        title: 'Vertical align',
        choices: [
          ['top', 'Top'],
          ['middle', 'Middle'],
          ['bottom', 'Bottom'],
        ],
        default: 'middle',
      },
    },
    required: [],
  };
};

export default ItemBlockSchema;
