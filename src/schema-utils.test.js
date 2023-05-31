import {
  addTypeSelect,
  schemaEnhancerFactory,
  getVoltoStyles,
  composeSchema,
} from './schema-utils';

jest.mock('@plone/volto/registry', () => ({
  blocks: {
    blocksConfig: {
      listing: {
        extensions: {
          myExtension: [
            { id: 'default', title: 'Default', isDefault: true },
            { id: 'custom', title: 'Custom' },
          ],
        },
      },
    },
  },
}));

const messages = {
  title: { id: 'title', defaultMessage: 'Title' },
};

const intl = {
  formatMessage: (msg) => msg.defaultMessage,
};

describe('addTypeSelect', () => {
  it('adds @type field to schema', () => {
    const schema = addTypeSelect({
      intl,
      schema: { properties: {}, fieldsets: [{ id: 'default', fields: [] }] },
      extensionName: 'myExtension',
      messages,
    });

    expect(schema.properties['@type']).toBeDefined();
    expect(schema.fieldsets[0].fields[0]).toBe('@type');
  });
});

describe('schemaEnhancerFactory', () => {
  it('return schema with the default extension', () => {
    const enhancer = schemaEnhancerFactory({
      extensionName: 'myExtension',
      messages,
    });
    const schema = enhancer({
      schema: { properties: {}, fieldsets: [] },
      formData: {
        itemModel: {},
      },
      intl,
    });
    expect(schema).toEqual({ properties: {}, fieldsets: [] });
  });
});

describe('getVoltoStyles', () => {
  it('return output object with the style keys', () => {
    const style = {
      color: 'red',
      background: true,
    };

    const output = getVoltoStyles(style);
    expect(output).toEqual({
      red: 'red',
      background: 'background',
    });
  });
});

describe('composeSchema', () => {
  it('return schema with multiple schema enhancers', () => {
    const enhancer1 = ({ schema }) => ({ ...schema, enhancer1: true });
    const enhancer2 = ({ schema }) => ({ ...schema, enhancer2: true });

    const composer = composeSchema(enhancer1, enhancer2);
    const schema = composer({ schema: { properties: {}, fieldsets: [] } });

    expect(schema).toEqual({
      properties: {},
      fieldsets: [],
      enhancer1: true,
      enhancer2: true,
    });
  });
});
