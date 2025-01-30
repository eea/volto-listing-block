import cx from 'classnames';

import { Card as UiCard } from 'semantic-ui-react';

import {
  CardDescription,
  CardExtra,
  CardImage,
  CardMeta,
  CardTitle,
} from '@eeacms/volto-listing-block/components/UniversalCard';

const getStyles = (props) => {
  const { itemModel = {} } = props;
  const res = {};
  if (itemModel.maxDescription) {
    res[`max-${itemModel.maxDescription}-lines`] = true;
  }
  if (itemModel.maxTitle) {
    res[`title-max-${itemModel.maxTitle}-lines`] = true;
  }
  return res;
};

const VisualizationCard = (props) => {
  const { className } = props;
  const imagePosition = props.imagePosition;
  return (
    <UiCard fluid={true} className={cx('u-card', getStyles(props), className)}>
      <UiCard.Content>
        <CardTitle {...props} />
        <CardDescription {...props} />
        <CardImage {...props} />
        <CardMeta {...props} />
      </UiCard.Content>
      {imagePosition && imagePosition === 'right' && <CardImage {...props} />}

      <CardExtra {...props} />
    </UiCard>
  );
};

export default VisualizationCard;
