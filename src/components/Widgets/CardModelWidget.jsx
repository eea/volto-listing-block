import React from 'react';
import { Tab } from 'semantic-ui-react';
import { Field } from '@plone/volto/components/manage/Form';

/**
 * Volto's ObjectWidget, with one addition: the fields also get
 * `onChangeObject(patch)`, so a field can update its sibling fields. The card
 * elements widget uses it to edit the settings of each element (e.g. the
 * publication date or the title max lines) in place.
 */
const FieldSet = ({
  block,
  data,
  schema,
  value,
  errors,
  onChange,
  onChangeBlock,
  id,
}) =>
  data.fields.map((field, idx) => (
    <Field
      {...schema.properties[field]}
      id={`${field}-${idx}-${id}`}
      fieldSet={data.title.toLowerCase()}
      block={block}
      value={value?.[field]}
      objectvalue={value}
      required={schema.required?.indexOf(field) !== -1}
      onChange={(field2, fieldvalue) =>
        onChange(id, { ...value, [field]: fieldvalue })
      }
      onChangeObject={(patch) => onChange(id, { ...value, ...patch })}
      key={field}
      error={errors?.[field]}
      title={schema.properties[field].title}
      onChangeBlock={onChangeBlock}
    />
  ));

const CardModelWidget = ({
  block,
  schema,
  value,
  onChange,
  onChangeBlock,
  errors = {},
  id,
}) => {
  const fieldSetProps = {
    block,
    schema,
    errors,
    value,
    onChange,
    onChangeBlock,
    id,
  };

  return schema.fieldsets.length === 1 ? (
    <FieldSet {...fieldSetProps} data={schema.fieldsets[0]} />
  ) : (
    <Tab
      panes={schema.fieldsets.map((fieldset) => ({
        menuItem: fieldset.title,
        render: () => (
          <Tab.Pane>
            <FieldSet {...fieldSetProps} data={fieldset} />
          </Tab.Pane>
        ),
      }))}
    />
  );
};

export default CardModelWidget;
