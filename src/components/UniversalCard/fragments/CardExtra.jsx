import { Button, Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import CardActionContext from './CardActionContext';
import RenderBlocksWrapper from './RenderBlocksWrapper';
import { Modal } from 'semantic-ui-react';
import { useSelector } from 'react-redux';

const RenderModal = React.memo(({ children, open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className={'enlarge-modal visualization-card-modal'}
      closeIcon={
        <button className="ui button close icon">
          <i className="ri-close-fill" />
        </button>
      }
    >
      <Modal.Content>{children}</Modal.Content>
    </Modal>
  );
});

const getCallToAction = (item, options) => {
  const { urlTemplate } = options;
  return urlTemplate
    ? urlTemplate
        .replace('$PORTAL_URL', config.settings.publicURL)
        .replace('$URL', flattenToAppURL(item['@id']))
    : options.href?.[0]?.['@id'] || item['@id'];
};

export const CardActionProvider = ({
  item,
  itemModel = {},
  isEditMode,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const screenWidth = useSelector((state) => state.screen?.width);
  const popupEnabled = !!itemModel.enableCTAPopup && screenWidth >= 1280;
  const url = getCallToAction(item, itemModel.callToAction || {});
  const action = {
    url,
    disabled: !!isEditMode || !url,
    onClick: (event) => {
      if (isEditMode) {
        event.preventDefault();
      } else if (popupEnabled) {
        event.preventDefault();
        setOpen(true);
      }
    },
  };

  return (
    <>
      <CardActionContext.Provider value={action}>
        {children}
      </CardActionContext.Provider>
      {popupEnabled && open && (
        <RenderModal open={open} onClose={() => setOpen(false)}>
          <RenderBlocksWrapper location={{ pathname: url }} />
        </RenderModal>
      )}
    </>
  );
};

const getButtonClassName = (styles) => {
  const theme = styles?.['theme:noprefix'] || '';

  return styles?.['inverted:bool']
    ? theme
      ? `${theme} inverted`
      : 'basic black'
    : theme;
};

const LinkCTAButton = React.memo(({ url, className, label }) => {
  return (
    <Button as="a" href={url} className={className} role={''}>
      {label}
    </Button>
  );
});

const PopupCTAButton = React.memo(({ url, className, label }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupEnabled, setIsPopupEnabled] = useState(true);
  const screenWidth = useSelector((state) => state.screen.width);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    setIsPopupEnabled(screenWidth >= 1280);
  }, [screenWidth]);

  const result = { location: { pathname: url } };

  if (!isPopupEnabled) {
    return <LinkCTAButton url={url} className={className} label={label} />;
  }

  return (
    <>
      <Button onClick={handleOpenModal} className={className}>
        {label}
      </Button>
      <RenderModal open={isModalOpen} onClose={handleCloseModal}>
        <RenderBlocksWrapper {...result} />
      </RenderModal>
    </>
  );
});

const CallToAction = React.memo(({ item, itemModel }) => {
  const action = useContext(CardActionContext);
  const url = useMemo(
    () => getCallToAction(item, itemModel.callToAction),
    [item, itemModel.callToAction],
  );

  const buttonClassName = useMemo(
    () => getButtonClassName(itemModel.styles),
    [itemModel.styles],
  );

  const buttonLabel = itemModel.callToAction.label || 'Read more';
  const shouldShowPopup = itemModel.enableCTAPopup;

  if (action) {
    return (
      <Button
        as="a"
        href={action.disabled ? undefined : action.url}
        onClick={action.onClick}
        className={buttonClassName}
        role={action.disabled ? undefined : 'link'}
      >
        {buttonLabel}
      </Button>
    );
  }

  return shouldShowPopup ? (
    <PopupCTAButton url={url} className={buttonClassName} label={buttonLabel} />
  ) : (
    <LinkCTAButton url={url} className={buttonClassName} label={buttonLabel} />
  );
});

const Tag = ({ item }) => {
  const renderTag = config.blocks.blocksConfig.teaser.renderTag;
  return !!item?.Subject
    ? item.Subject.map((tag, i) => renderTag(tag, i))
    : null;
};

const CardExtra = ({ item, itemModel = {} }) => {
  const showCallToAction = itemModel?.callToAction?.enable;
  const showTags = itemModel.hasTags;
  const show = showCallToAction || showTags;

  return show ? (
    <UiCard.Content extra>
      {showTags && item?.Subject?.length > 0 && (
        <div className={'tags labels'}>
          <Tag item={item} />
        </div>
      )}
      {showCallToAction && <CallToAction item={item} itemModel={itemModel} />}
    </UiCard.Content>
  ) : null;
};

export default CardExtra;
