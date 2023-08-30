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

const BasicCard = (props) => {
  const { className } = props;
  const imagePosition = props.imagePosition;
  return (
    <UiCard fluid={true} className={cx('u-card', getStyles(props), className)}>
      {(!imagePosition || (imagePosition && imagePosition === 'left')) && (
        <CardImage {...props} />
      )}
      <UiCard.Content>
        <CardMeta {...props} />
        <CardTitle {...props} />
        <CardDescription {...props} />
      </UiCard.Content>
      {imagePosition && imagePosition === 'right' && <CardImage {...props} />}
      <CardExtra {...props} />
    </UiCard>
  );
};

export const DefaultCardLayout = BasicCard;

export const LeftImageCardLayout = (props) => (
  <BasicCard
    {...props}
    imagePosition={'left'}
    className={cx(props.className, 'item-card left-image-card')}
  />
);

export const RightImageCardLayout = (props) => (
  <BasicCard
    {...props}
    imagePosition={'right'}
    className={cx(props.className, 'item-card right-image-card')}
  />
);

export const ImageCardLayout = (props) => {
  const { className } = props;

  return (
    <UiCard
      fluid={true}
      className={cx('u-card', getStyles(props), {
        [className]: className,
      })}
    >
      <CardImage {...props} />
    </UiCard>
  );
};
