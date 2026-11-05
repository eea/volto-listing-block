import { adjustTeaserSchema, EXTERNAL_LINK_FIELD } from './schema';

const makeSchema = () => ({
  fieldsets: [{ id: 'default', fields: ['href', 'overwrite'] }],
  properties: { href: { selectedItemAttrs: [] } },
  required: [],
});

describe('adjustTeaserSchema', () => {
  it('adds the external_link field right after href', () => {
    const schema = adjustTeaserSchema({ schema: makeSchema() });

    expect(schema.fieldsets[0].fields).toEqual([
      'href',
      EXTERNAL_LINK_FIELD,
      'overwrite',
    ]);
    expect(schema.properties[EXTERNAL_LINK_FIELD]).toEqual(
      expect.objectContaining({ widget: 'url' }),
    );
  });

  it('does not duplicate the field on repeated enhancement', () => {
    const schema = makeSchema();
    adjustTeaserSchema({ schema });
    adjustTeaserSchema({ schema });

    expect(
      schema.fieldsets[0].fields.filter((f) => f === EXTERNAL_LINK_FIELD),
    ).toHaveLength(1);
  });
});
