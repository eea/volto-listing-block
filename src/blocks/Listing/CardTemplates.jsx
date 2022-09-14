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
  const { cardModel = {} } = props;
  const res = {};
  if (cardModel.maxDescription) {
    res[`max-${cardModel.maxDescription}-lines`] = true;
  }
  return res;
};

const BasicCard = (props) => {
  const { className } = props;
  return (
    <UiCard fluid={true} className={cx('u-card', getStyles(props), className)}>
      <CardImage {...props} />
      <UiCard.Content>
        <CardMeta {...props} />
        <CardTitle {...props} />
        <CardDescription {...props} />
        <CardExtra {...props} />
      </UiCard.Content>
    </UiCard>
  );
};

export const DefaultCardLayout = BasicCard;

export const LeftImageCardLayout = (props) => (
  <BasicCard
    {...props}
    className={cx(props.className || 'left-image-card', '')}
  />
);

export const RightImageCardLayout = (props) => (
  <BasicCard
    {...props}
    className={cx(props.className || 'right-image-card', '')}
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
