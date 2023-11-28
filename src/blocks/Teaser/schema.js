export const adjustTeaserSchema = ({ schema }) => {
  // make the title required for accessibility reasons
  if (schema.properties?.title && schema.required?.indexOf('title') === -1) {
    schema.required.push('title');
  }

  //use the attached image widget for image override
  if (schema?.properties?.preview_image?.widget)
    schema.properties.preview_image.widget = 'attachedimage';
  schema.properties.href.selectedItemAttrs.push('Subject');
  schema.properties.href.selectedItemAttrs.push('@type');
  schema.properties.href.selectedItemAttrs.push('EffectiveDate');
  schema.properties.href.selectedItemAttrs.push('ExpirationDate');
  schema.properties.href.selectedItemAttrs.push('start');

  return schema;
};
