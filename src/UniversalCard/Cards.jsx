import cx from 'classnames';

import { Card as UiCard } from 'semantic-ui-react';

import CardDescription from './CardDescription';
import CardExtra from './CardExtra';
import CardImage from './CardImage';
import CardMeta from './CardMeta';
import CardTitle from './CardTitle';

const getStyles = (props) => {
  const { cardModel = {} } = props;
  const res = {};
  if (cardModel.maxDescription) {
    res[`max-${cardModel.maxDescription}-lines`] = true;
  }
  return res;
};

const BasicCard = (props) => {
  const { styles, className } = props;

  return (
    <UiCard
      fluid={true}
      className={cx('u-card', styles?.theme, getStyles(props), className)}
    >
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
  const { styles, className } = props;

  return (
    <UiCard
      fluid={true}
      className={cx('u-card', styles?.theme, getStyles(props), {
        [className]: className,
      })}
    >
      <CardImage {...props} />
    </UiCard>
  );
};
