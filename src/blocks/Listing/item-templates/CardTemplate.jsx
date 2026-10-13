import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { Card as UiCard, Icon } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { formatDate } from '@plone/volto/helpers/Utils/Date';

import {
  CardActionLink,
  CardDescription,
  CardExtra,
  CardImage,
  CardMeta,
  CardTitle,
} from '@eeacms/volto-listing-block/components/UniversalCard';
import { getMaxLinesClasses } from '@eeacms/volto-listing-block/components/UniversalCard/utils';
import useBenchmarkLevels from '@eeacms/volto-listing-block/components/UniversalCard/useBenchmarkLevels';
import {
  BENCHMARK,
  CONTENT_TYPE,
  CTA,
  DATE,
  DESCRIPTION,
  IMAGE,
  TAGS,
  TITLE,
  getElementsOrder,
  getHiddenElements,
  isFlipEnabled,
  splitFooter,
  splitSides,
} from '@eeacms/volto-listing-block/components/UniversalCard/elements';

import '@eeacms/volto-listing-block/less/benchmark-visualization.less';
import '@eeacms/volto-listing-block/less/teaser-cards.less';

export const CardBenchmarkLevel = ({ item }) => {
  const benchmarkLevelItems = useBenchmarkLevels();
  const benchmarkLevel = item?.['benchmark_level']?.[0];
  const benchmarkLevelItem = benchmarkLevelItems?.find(
    ({ value }) => value === benchmarkLevel,
  );

  return (
    <div className="benchmark_level_wrapper">
      <div className={`metadata benchmark_level ${benchmarkLevel ?? -1}`}>
        &nbsp;
      </div>
      {benchmarkLevelItem?.label}
    </div>
  );
};

CardBenchmarkLevel.propTypes = {
  item: PropTypes.shape({
    benchmark_level: PropTypes.arrayOf(PropTypes.string),
  }),
};

const CardContentType = ({ item, itemModel }) => {
  const contentType = item.type_title || item['@type'];
  return itemModel.hasMetaType && contentType ? (
    <UiCard.Meta className="content-type">{contentType}</UiCard.Meta>
  ) : null;
};

// The head title (e.g. the source of a search result, or the head title of a
// teaser), shown below the card content when content type and date are not
// in one metadata row (where it replaces the content type).
const CardSource = ({ head_title }) =>
  head_title ? (
    <UiCard.Meta className="card-source">{head_title}</UiCard.Meta>
  ) : null;

const CardPublishingDate = ({ item, itemModel }) => {
  const { EffectiveDate } = item;
  return itemModel.hasDate !== false &&
    EffectiveDate &&
    EffectiveDate !== 'None' ? (
    <UiCard.Meta className="publishing-date">
      <time dateTime={EffectiveDate}>
        {formatDate({
          date: EffectiveDate,
          format: {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          },
          locale: config.settings.dateLocale || 'en-gb',
        })}
      </time>
    </UiCard.Meta>
  ) : null;
};

const isMeta = (id) => id === CONTENT_TYPE || id === DATE;

/**
 * Renders the card elements in the given order. The content type and the
 * date share one metadata row when they are next to each other, as in the
 * default card.
 */
const renderElements = (order, props, image, withSource = true) => {
  const { item, itemModel } = props;
  const { hasBenchmarkLevel, hasIcon, icon } = itemModel;
  const rendered = [];
  let hasMetaRow = false;

  for (let index = 0; index < order.length; index++) {
    const id = order[index];

    if (isMeta(id) && isMeta(order[index + 1])) {
      rendered.push(<CardMeta key="meta" {...props} />);
      hasMetaRow = true;
      index++;
      continue;
    }

    switch (id) {
      case IMAGE:
        if (itemModel.imagePosition !== 'none') {
          rendered.push(<React.Fragment key={id}>{image}</React.Fragment>);
        }
        break;
      case CONTENT_TYPE:
        rendered.push(<CardContentType key={id} {...props} />);
        break;
      case DATE:
        rendered.push(
          <CardPublishingDate key={id} item={item} itemModel={itemModel} />,
        );
        break;
      case TITLE:
        rendered.push(
          <React.Fragment key={id}>
            {hasIcon && icon && <Icon className={icon} size="large" />}
            <CardTitle {...props} />
          </React.Fragment>,
        );
        break;
      case BENCHMARK:
        if (hasBenchmarkLevel) {
          rendered.push(<CardBenchmarkLevel key={id} item={item} />);
        }
        break;
      case DESCRIPTION:
        rendered.push(<CardDescription key={id} {...props} />);
        break;
      case TAGS:
      case CTA:
        // moved between the other elements, not in the footer
        rendered.push(<CardExtra key={id} {...props} parts={[id]} inline />);
        break;
      default:
        break;
    }
  }

  if (!hasMetaRow && withSource) {
    rendered.push(<CardSource key="source" head_title={props.head_title} />);
  }

  return rendered;
};

/**
 * The content of a card (or of one side of a flip card): an image shown
 * first stays outside the content, as in the default card, and the trailing
 * tags and call to action go to the footer.
 */
const CardFace = (props) => {
  const { itemModel = {}, order: fullOrder, image, withSource = true } = props;
  const { imagePosition = 'top' } = itemModel;
  const { body: order, footer } = splitFooter(fullOrder);
  const hidden = getHiddenElements(itemModel);
  const leadingImage = order.find((id) => !hidden.includes(id)) === IMAGE;
  const contentOrder = leadingImage
    ? order.filter((id) => id !== IMAGE)
    : order;

  return (
    <>
      {(leadingImage || imagePosition === 'left') && image}
      <UiCard.Content>
        {renderElements(contentOrder, props, image, withSource)}
      </UiCard.Content>
      {imagePosition === 'right' && image}
      <CardExtra {...props} parts={footer} />
    </>
  );
};

// The whole side of a flip card leads to the card destination, also when
// the side has no title or image link (e.g. only the description). Out of
// the tab order: the title link is the one for the keyboard.
const FlipCardLink = ({ item }) => (
  <CardActionLink
    className="flip-card-link"
    aria-label={typeof item.title === 'string' ? item.title : item.Title}
    tabIndex={-1}
  />
);

/**
 * The single card template. Image position, overlay mode, the displayed
 * metadata and the order of the elements are driven by the itemModel
 * controls.
 */
const CardTemplate = (props) => {
  const { className, itemModel = {} } = props;
  const { imagePosition = 'top', contentMode } = itemModel;

  // the preview image is picked by content type in UniversalCard
  const image = <CardImage {...props} />;
  const classes = cx('u-card', getMaxLinesClasses(itemModel), className);

  if (contentMode === 'overlay') {
    return (
      <UiCard fluid={true} className={classes}>
        {image}
      </UiCard>
    );
  }

  // Title on top and the logo centred below it (teaser-cards.less), the
  // former "Image on bottom" card
  if (contentMode === 'logo') {
    return (
      <UiCard fluid={true} className={cx(classes, 'image-on-bottom-card')}>
        <UiCard.Content>
          <CardTitle {...props} />
        </UiCard.Content>
        {image}
        <CardExtra {...props} />
      </UiCard>
    );
  }

  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
  const order = getElementsOrder({ ...itemModel, '@type': 'card' });
  const hidden = getHiddenElements(itemModel);
  const sides = isFlipEnabled(itemModel) ? splitSides(itemModel, order) : null;
  const isVisible = (id) => !hidden.includes(id);

  // a flip card needs something to show on its back
  if (sides && sides.back.some(isVisible)) {
    return (
      // the outer card only holds the place in the grid, both sides are
      // full cards with the styling of the card; focusable so that a tap
      // turns it over on touch screens
      <UiCard fluid={true} className="flip-card" tabIndex={-1}>
        <div className="flip-card-inner">
          <div className={cx('ui fluid card flip-card-front', classes)}>
            <FlipCardLink item={props.item} />
            <CardFace {...props} order={sides.front} image={image} />
          </div>
          <div className={cx('ui fluid card flip-card-back', classes)}>
            <FlipCardLink item={props.item} />
            <CardFace
              {...props}
              order={sides.back}
              image={image}
              withSource={false}
            />
          </div>
        </div>
      </UiCard>
    );
  }

  return (
    <UiCard
      fluid={true}
      className={cx(classes, {
        'item-card': isHorizontal,
        'left-image-card': imagePosition === 'left',
        'right-image-card': imagePosition === 'right',
      })}
    >
      <CardFace {...props} order={order} image={image} />
    </UiCard>
  );
};

CardTemplate.propTypes = {
  item: PropTypes.object.isRequired,
  itemModel: PropTypes.shape({
    imagePosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'none']),
    contentMode: PropTypes.oneOf(['default', 'overlay', 'logo']),
    hasBenchmarkLevel: PropTypes.bool,
    elementsOrder: PropTypes.arrayOf(PropTypes.string),
    flip: PropTypes.bool,
    flipSides: PropTypes.objectOf(PropTypes.oneOf(['front', 'back'])),
  }),
  className: PropTypes.string,
  preview_image_url: PropTypes.string,
};

export default CardTemplate;
