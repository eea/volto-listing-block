import { Button, Label, Card as UiCard } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { flattenToAppURL } from '@plone/volto/helpers';

const getCallToAction = (item, options) => {
  const { urlTemplate } = options;
  return urlTemplate
    ? urlTemplate
        .replace('$PORTAL_URL', config.settings.publicURL)
        .replace('$URL', flattenToAppURL(item['@id']))
    : options.href?.[0]?.['@id'] || item['@id'];
};

const CallToAction = ({ item, cardModel, styles }) => (
  <Button
    as="a"
    href={getCallToAction(item, cardModel.callToAction)}
    className={styles?.theme ? ' inverted' : ''}
  >
    {cardModel.callToAction.label || 'Read more'}
  </Button>
);

const Tags = ({ item }) => {
  return !!item?.Subject
    ? item.Subject.map((tag, i) => <Label key={i}>{tag}</Label>)
    : null;
};

const CardExtra = ({ item, cardModel = {}, ...rest }) => {
  const showCallToAction = cardModel?.callToAction?.enable;
  const showTags = cardModel.hasTags;
  const show = showCallToAction || showTags;

  return show ? (
    <UiCard.Content extra>
      {showTags && <Tags item={item} cardModel={cardModel} {...rest} />}
      {showCallToAction && (
        <CallToAction item={item} cardModel={cardModel} {...rest} />
      )}
    </UiCard.Content>
  ) : null;
};

export default CardExtra;
