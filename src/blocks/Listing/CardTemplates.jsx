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

const getVoltoStyles = (props) => {
  const styles = props ? props : {};
  const output = {};
  for (const [key, value] of Object.entries(styles)) {
    if (styles[key] === true) {
      output[key] = key;
    } else {
      output[value] = value;
    }
  }
  return output;
};

const BasicCard = (props) => {
  const { styles, className } = props;
  return (
    <UiCard
      fluid={true}
      className={cx(
        'u-card',
        getStyles(props),
        getVoltoStyles(styles),
        className,
      )}
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
      className={cx('u-card', getVoltoStyles(styles), getStyles(props), {
        [className]: className,
      })}
    >
      <CardImage {...props} />
    </UiCard>
  );
};
