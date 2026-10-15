import React from 'react';
import cx from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import { Checkbox } from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import DragDropList from '@plone/volto/components/manage/DragDropList/DragDropList';
import { Field } from '@plone/volto/components/manage/Form';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { reorderArray } from '@plone/volto/helpers/Utils/Utils';

import dragSVG from '@plone/volto/icons/drag.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';

import '@eeacms/volto-listing-block/less/card-elements-order.less';

const messages = defineMessages({
  show: {
    id: 'cardElementShow',
    defaultMessage: 'Show {element}',
  },
  settings: {
    id: 'cardElementSettings',
    defaultMessage: '{element} settings',
  },
  moveUp: {
    id: 'cardElementMoveUp',
    defaultMessage: 'Move {element} up',
  },
  moveDown: {
    id: 'cardElementMoveDown',
    defaultMessage: 'Move {element} down',
  },
  drag: {
    id: 'cardElementDrag',
    defaultMessage: 'Drag {element}',
  },
});

// A setting is a field of the card model, or a key of one of its object
// fields (e.g. { field: 'callToAction', key: 'label' })
const toSpec = (setting) =>
  typeof setting === 'string' ? { field: setting } : setting;

const getSettingKey = ({ field, key }) => (key ? `${field}.${key}` : field);

const getSettingValue = ({ field, key }, objectvalue = {}) =>
  key ? objectvalue[field]?.[key] : objectvalue[field];

export const isElementVisible = (toggle, objectvalue = {}) => {
  if (!toggle) return true;
  const value = getSettingValue(toggle, objectvalue);
  return value === undefined ? !!toggle.defaultVisible : value !== toggle.off;
};

/**
 * The card elements, in one place: drag (or move with the arrows) to order
 * them, switch them on / off and expand them for their settings (e.g. the
 * title max lines or the event date).
 *
 * Schema props:
 * - `elements`: [[id, label], ...] in the current order
 * - `elementSettings`: { [id]: { toggle: { field, key?, on, off,
 *   defaultVisible }, fields: [fieldId | { field, key }, ...] } }
 * - `fieldSchemas`: { [fieldId | 'field.key']: field schema } for the settings
 *
 * It stores the order in its own field and the element settings in the
 * sibling fields of the card model (needs the `card_model` widget).
 */
const CardElementsWidget = (props) => {
  const {
    id,
    onChange,
    onChangeObject,
    objectvalue = {},
    elements = [],
    elementSettings = {},
    fieldSchemas = {},
  } = props;
  const intl = useIntl();
  const [expanded, setExpanded] = React.useState([]);
  const order = elements.map(([elementId]) => elementId);
  const labels = Object.fromEntries(elements);

  const move = (from, to) => {
    if (to < 0 || to >= order.length || from === to) return;
    onChange(id, reorderArray(order, from, to));
  };
  const toggleExpanded = (elementId) =>
    setExpanded(
      expanded.includes(elementId)
        ? expanded.filter((e) => e !== elementId)
        : [...expanded, elementId],
    );
  const changeSetting = ({ field, key }, value) => {
    if (!onChangeObject) {
      // eslint-disable-next-line no-console
      console.warn('card_elements needs the card_model widget');
      return;
    }
    onChangeObject({
      [field]: key ? { ...(objectvalue[field] || {}), [key]: value } : value,
    });
  };

  return (
    <FormFieldWrapper {...props} columns={1} className="card-elements-order">
      <DragDropList
        childList={elements}
        onMoveItem={({ source, destination }) => {
          if (!destination) return;
          move(source.index, destination.index);
          return true;
        }}
      >
        {({ child, childId, index, draginfo }) => {
          const { toggle, fields = [] } = elementSettings[childId] || {};
          const visible = isElementVisible(toggle, objectvalue);
          const isExpanded = expanded.includes(childId);
          const hasSettings = fields.length > 0;

          return (
            <div
              ref={draginfo.innerRef}
              {...draginfo.draggableProps}
              key={childId}
              className={cx('card-element', {
                'card-element--off': !visible,
                'card-element--expanded': isExpanded,
              })}
            >
              <div className="card-element-header">
                {/* not a <button>: react-beautiful-dnd does not start drags
                    from interactive elements; it makes the handle focusable */}
                <span
                  {...draginfo.dragHandleProps}
                  className="drag handle"
                  aria-label={intl.formatMessage(messages.drag, {
                    element: child,
                  })}
                >
                  <Icon name={dragSVG} size="18px" />
                </span>
                <button
                  type="button"
                  className="card-element-label"
                  disabled={!hasSettings}
                  aria-expanded={hasSettings ? isExpanded : undefined}
                  aria-label={
                    hasSettings
                      ? intl.formatMessage(messages.settings, {
                          element: child,
                        })
                      : undefined
                  }
                  onClick={() => toggleExpanded(childId)}
                >
                  {/* the placeholder keeps the labels aligned */}
                  <span className="card-element-chevron">
                    {hasSettings && <Icon name={rightSVG} size="16px" />}
                  </span>
                  <span className="card-element-name">{child}</span>
                </button>
                {toggle && (
                  <Checkbox
                    toggle
                    checked={visible}
                    aria-label={intl.formatMessage(messages.show, {
                      element: child,
                    })}
                    onChange={(event, { checked }) =>
                      changeSetting(toggle, checked ? toggle.on : toggle.off)
                    }
                  />
                )}
                <span className="card-element-tools">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={intl.formatMessage(messages.moveUp, {
                      element: labels[childId],
                    })}
                  >
                    <Icon name={upSVG} size="18px" />
                  </button>
                  <button
                    type="button"
                    disabled={index === order.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={intl.formatMessage(messages.moveDown, {
                      element: labels[childId],
                    })}
                  >
                    <Icon name={downSVG} size="18px" />
                  </button>
                </span>
              </div>
              {hasSettings && isExpanded && (
                <div className="card-element-settings">
                  {fields.map(toSpec).map((spec) => {
                    const settingKey = getSettingKey(spec);
                    return (
                      <Field
                        {...fieldSchemas[settingKey]}
                        key={settingKey}
                        id={`${id}-${childId}-${settingKey}`}
                        value={getSettingValue(spec, objectvalue)}
                        onChange={(fieldId, value) =>
                          changeSetting(spec, value)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        }}
      </DragDropList>
    </FormFieldWrapper>
  );
};

export default CardElementsWidget;
