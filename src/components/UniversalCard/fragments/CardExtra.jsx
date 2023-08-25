import { Button, Label, Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { flattenToAppURL } from '@plone/volto/helpers';
import messages from '@eeacms/volto-listing-block/messages';

const getCallToAction = (item, options) => {
  const { urlTemplate } = options;
  return urlTemplate
    ? urlTemplate
        .replace('$PORTAL_URL', config.settings.publicURL)
        .replace('$URL', flattenToAppURL(item['@id']))
    : options.href?.[0]?.['@id'] || item['@id'];
};

const CallToAction = ({ item, itemModel }) => (
  <Button
    as="a"
    href={getCallToAction(item, itemModel.callToAction)}
    className={
      itemModel.styles?.['theme:noprefix']
        ? itemModel.styles?.['inverted:bool']
          ? itemModel.styles?.['theme:noprefix'] + ' inverted'
          : 'inverted'
        : 'tertiary inverted'
    }
  >
    {itemModel.callToAction.label || intl.formatMessage(messages.ReadMore)}
  </Button>
);

const Tags = ({ item }) => {
  return !!item?.Subject
    ? item.Subject.map((tag, i) => <Label key={i}>{tag}</Label>)
    : null;
};

const CardExtra = ({ item, itemModel = {}, ...rest }) => {
  const showCallToAction = itemModel?.callToAction?.enable;
  const showTags = itemModel.hasTags;
  const show = showCallToAction || showTags;

  return show ? (
    <UiCard.Content extra>
      {showTags && item?.Subject?.length > 0 && (
        <div className={'tags labels'}>
          <Tags item={item} itemModel={itemModel} {...rest} />
        </div>
      )}
      {showCallToAction && (
        <CallToAction item={item} itemModel={itemModel} {...rest} />
      )}
    </UiCard.Content>
  ) : null;
};

export default CardExtra;
