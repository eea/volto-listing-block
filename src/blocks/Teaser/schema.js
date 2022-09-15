export const adjustTeaserSchema = (schema) => {
  // const fieldset = schema.fieldsets.find(({fields}) => fields?.indexOf('title') > -1);

  // make the title required for accessibility reasons
  if (schema.properties?.title && schema.required?.indexOf('title') === -1) {
    schema.required.push('title');
  }

  schema.properties.href.selectedItemAttrs.push('Subject');
  schema.properties.href.selectedItemAttrs.push('@type');
  schema.properties.href.selectedItemAttrs.push('EffectiveDate');
  schema.properties.href.selectedItemAttrs.push('ExpirationDate');

  return schema;
};
