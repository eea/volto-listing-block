import React from 'react';
import messages from '@eeacms/volto-listing-block/messages';
import { connect } from 'react-redux';
import { isArray } from 'lodash';
import config from '@plone/volto/registry';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import SlateEditor from '@plone/volto-slate/editor/SlateEditor';
import { handleKey } from '@plone/volto-slate/blocks/Text/keyboard';
import {
  uploadContent,
  saveSlateBlockSelection,
} from '@plone/volto-slate/actions';

import Item from './Item';
import getSchema from './schema';

export const createSlateParagraph = (text) => {
  return isArray(text) ? text : config.settings.slate.defaultValue();
};

const Edit = (props) => {
  const { slate } = config.settings;
  const {
    data = {},
    block = null,
    selected = false,
    index,
    properties,
    onChangeBlock,
    onSelectBlock,
  } = props;
  const { description } = data;
  const schema = React.useMemo(() => getSchema(props), [props]);

  const withBlockProperties = React.useCallback(
    (editor) => {
      editor.getBlockProps = () => props;
      return editor;
    },
    [props],
  );

  const handleFocus = React.useCallback(() => {
    if (!selected) {
      onSelectBlock(block);
    }
  }, [onSelectBlock, selected, block]);

  return (
    <>
      <Item {...data} mode="edit">
        <SlateEditor
          index={index}
          properties={properties}
          extensions={slate.textblockExtensions}
          renderExtensions={[withBlockProperties]}
          value={createSlateParagraph(description)}
          onChange={(description) => {
            onChangeBlock(block, {
              ...data,
              description,
            });
          }}
          block={block}
          onFocus={handleFocus}
          onKeyDown={handleKey}
          selected={selected}
          placeholder={intl.formatMessage(messages.SlateEditorPlaceHolder)}
          slateSettings={slate}
        />
      </Item>
      <SidebarPortal selected={selected}>
        <BlockDataForm
          block={block}
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </>
  );
};

export default connect(
  (state, props) => {
    const blockId = props.block;
    return {
      defaultSelection: blockId
        ? state.slate_block_selections?.[blockId]
        : null,
      uploadRequest: state.upload_content?.[props.block]?.upload || {},
      uploadedContent: state.upload_content?.[props.block]?.data || {},
    };
  },
  {
    uploadContent,
    saveSlateBlockSelection, // needed as editor blockProps
  },
)(Edit);
