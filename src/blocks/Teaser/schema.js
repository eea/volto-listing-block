export const EXTERNAL_LINK_FIELD = 'external_link';

const addExternalLinkField = (schema) => {
  const fieldset =
    schema.fieldsets?.find(({ id }) => id === 'default') ||
    schema.fieldsets?.[0];

  if (fieldset?.fields && !fieldset.fields.includes(EXTERNAL_LINK_FIELD)) {
    const hrefIndex = fieldset.fields.indexOf('href');
    fieldset.fields.splice(
      hrefIndex === -1 ? fieldset.fields.length : hrefIndex + 1,
      0,
      EXTERNAL_LINK_FIELD,
    );
  }

  schema.properties[EXTERNAL_LINK_FIELD] = {
    title: 'External link',
    description:
      'When set, the card links here instead of the linked content item.',
    widget: 'url',
  };

  return schema;
};

export const adjustTeaserSchema = ({ schema }) => {
  // make the title required for accessibility reasons
  if (schema.properties?.title && schema.required?.indexOf('title') === -1) {
    schema.required.push('title');
  }

  //use the attached image widget for image override
  if (schema?.properties?.preview_image?.widget) {
    schema.properties.preview_image.widget = 'attachedimage';
    schema.properties.preview_image.selectedItemAttrs = [
      'image_field',
      'image_scales',
      '@type',
    ];
  }
  schema.properties.href.selectedItemAttrs.push('Subject');
  schema.properties.href.selectedItemAttrs.push('@type');
  schema.properties.href.selectedItemAttrs.push('EffectiveDate');
  schema.properties.href.selectedItemAttrs.push('ExpirationDate');
  schema.properties.href.selectedItemAttrs.push('start');
  // used to resolve content type based previews (e.g. indicators)
  schema.properties.href.selectedItemAttrs.push('UID');

  addExternalLinkField(schema);

  return schema;
};
