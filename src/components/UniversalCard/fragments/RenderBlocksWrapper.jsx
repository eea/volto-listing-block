import { RenderBlocks } from '@plone/volto/components';
import { useDispatch } from 'react-redux';
import React from 'react';
import { getContent } from '@plone/volto/actions';
import { useSelector } from 'react-redux';

import { flattenToAppURL } from '@plone/volto/helpers';

import config from '@plone/volto/registry';

const RenderBlocksWrapper = (props) => {
  const dispatch = useDispatch();

  const contentFromStore = useSelector(
    (state) => state.content.subrequests?.[props.location.pathname]?.data,
  );
  const loadingContent = useSelector(
    (state) => state.content.subrequests?.[props.location.pathname]?.loading,
  );

  React.useEffect(() => {
    if (!contentFromStore && !loadingContent) {
      // // Store the original apiExpanders configuration
      const originalApiExpanders = [...(config.settings.apiExpanders || [])];

      // Clear the apiExpanders configuration
      config.settings.apiExpanders = [];
      dispatch(
        getContent(props.location.pathname, null, props.location.pathname),
      ).finally(() => {
        // Restore the original apiExpanders configuration
        config.settings.apiExpanders = originalApiExpanders;
      });
    }
  }, [dispatch, props.location.pathname, contentFromStore, loadingContent]);
  return contentFromStore ? (
    <div>
      <div className="eea banner">
        <div className="gradient">
          <div className="content">
            <h1>{contentFromStore.title}</h1>
          </div>
        </div>
      </div>
      <RenderBlocks
        content={contentFromStore}
        location={{ pathname: flattenToAppURL(contentFromStore['@id']) }}
      />
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default React.memo(RenderBlocksWrapper);
