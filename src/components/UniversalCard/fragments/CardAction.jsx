import React, { createContext, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

import RenderBlocksWrapper from './RenderBlocksWrapper';

// The popup is only used on large screens, below it the action navigates
export const POPUP_MIN_WIDTH = 1280;

/**
 * The single destination of a card, shared by the title, the image and the
 * call to action: the CTA URL template, the CTA link, the external link of
 * the item (e.g. the "External link" of a teaser), then the item URL, with
 * its query string or hash when the listing provides one.
 */
export const getCardActionUrl = (item, options = {}) => {
  const { urlTemplate } = options;
  return urlTemplate
    ? urlTemplate
        .replace('$PORTAL_URL', config.settings.publicURL)
        .replace('$URL', flattenToAppURL(item['@id'] || ''))
    : options.href?.[0]?.['@id'] ||
        item.external_link ||
        item.linkHref ||
        item.linkWithHash ||
        item['@id'];
};

export const CardActionContext = createContext(null);

export const useCardAction = () => useContext(CardActionContext);

export const RenderModal = React.memo(({ children, open, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    className={'enlarge-modal visualization-card-modal'}
    dimmer={{ className: 'visualization-card-dimmer' }}
    closeIcon={
      <button className="ui button close icon">
        <i className="ri-close-fill" />
      </button>
    }
  >
    <Modal.Content>{children}</Modal.Content>
  </Modal>
));

/**
 * Provides the card action shared by the title, the image and the call to
 * action button, so they all lead to the same destination. With the CTA
 * popup enabled they all open the same popup (large screens only). In edit
 * mode they do nothing.
 */
export const CardActionProvider = ({
  item,
  itemModel = {},
  isEditMode,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const screenWidth = useSelector((state) => state.screen?.width);
  const popupEnabled =
    !!itemModel.enableCTAPopup && screenWidth >= POPUP_MIN_WIDTH;
  const url = getCardActionUrl(item, itemModel.callToAction);

  const action = useMemo(
    () => ({
      url,
      disabled: !!isEditMode || !url,
      // cards saved with "Clickable card" off: only the CTA links
      unlinked: itemModel.hasLink === false,
      onClick: (event) => {
        if (isEditMode) {
          event.preventDefault();
        } else if (popupEnabled) {
          event.preventDefault();
          setOpen(true);
        }
      },
    }),
    [url, isEditMode, popupEnabled, itemModel.hasLink],
  );

  return (
    <>
      <CardActionContext.Provider value={action}>
        {children}
      </CardActionContext.Provider>
      {popupEnabled && open && (
        <RenderModal open={open} onClose={() => setOpen(false)}>
          <RenderBlocksWrapper location={{ pathname: flattenToAppURL(url) }} />
        </RenderModal>
      )}
    </>
  );
};

/**
 * Whether the card action can be rendered as a link here: there is an
 * active action and we are not already inside one of its links (a link
 * inside a link is invalid HTML, e.g. the CTA of the compact item). The
 * call to action ignores `unlinked`, it always was a link.
 */
export const isCardActionLinkable = (action, { isCTA = false } = {}) =>
  !!action && !action.disabled && !action.linked && (isCTA || !action.unlinked);

/**
 * Links its children to the card action. Without an active action it
 * renders the children as they are, or wrapped in `fallback` (an element
 * type) with the same className.
 */
export const CardActionLink = ({
  children,
  className,
  fallback: Fallback,
  ...rest
}) => {
  const action = useCardAction();
  const linkedAction = useMemo(() => ({ ...action, linked: true }), [action]);

  if (!isCardActionLinkable(action)) {
    if (Fallback) {
      return <Fallback className={className}>{children}</Fallback>;
    }
    // React 17 does not accept undefined from render (e.g. no children)
    return children ?? null;
  }

  return (
    <UniversalLink
      href={action.url}
      onClick={action.onClick}
      openLinkInNewTab={false}
      className={className}
      {...rest}
    >
      <CardActionContext.Provider value={linkedAction}>
        {children}
      </CardActionContext.Provider>
    </UniversalLink>
  );
};
