import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Icon } from 'semantic-ui-react';
import loadable from '@loadable/component';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import ResponsiveContainer from '@eeacms/volto-listing-block/components/ResponsiveContainer';
import messages from '@eeacms/volto-listing-block/messages';

const Slider = loadable(() => import('react-slick'));

const tabletBreakpoint = 768;
const mobileLargeBreakpoint = 767;
const mobileBreakpoint = 480;

const getSlidesToShow = (items, _slidesToShow) => {
  if (_slidesToShow <= 0) return 1;
  if (items.length >= _slidesToShow) return parseInt(_slidesToShow);
  return items.length;
};

const getSlidesToScroll = (items, _slidesToShow, _slidesToScroll) => {
  if (_slidesToScroll <= 0) return 1;
  const slidesToShow = getSlidesToShow(items, _slidesToShow);
  if (slidesToShow >= _slidesToScroll) return parseInt(_slidesToScroll);
  return slidesToShow;
};

const PrevArrow = (props) => {
  const { onClick } = props;

  return (
    <Button
      aria-label={intl.formatMessage(messages.PreviousSlide)}
      className="slider-arrow prev-arrow tablet or lower hidden"
      icon
      onClick={onClick}
    >
      <Icon className="ri-arrow-left-s-line" />
    </Button>
  );
};

const NextArrow = (props) => {
  const { className, onClick } = props;

  return (
    <Button
      aria-label={intl.formatMessage(messages.NextSlide)}
      className={
        (className.indexOf('slick-disabled') !== -1 ? 'slick-disabled' : '') +
        ' slider-arrow next-arrow tablet or lower hidden'
      }
      icon
      onClick={onClick}
    >
      <Icon className="ri-arrow-right-s-line" />
    </Button>
  );
};

const CardsCarousel = ({ block, items, ...rest }) => {
  const slider = React.useRef(null);
  const dots_parent = React.useRef(null);
  const slidesToShow = getSlidesToShow(items, rest.slidesToShow || 4);
  const settings = {
    dots: true,
    infinite: true,
    arrows: items.length > slidesToShow,
    initialSlide: 0,
    lazyLoad: 'progressive',
    slidesToShow: slidesToShow,
    slidesToScroll: getSlidesToScroll(
      items,
      rest.slidesToShow || 4,
      rest.slidesToScroll || 1,
    ),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: (i) => (
      <button className={'slider-dots-button'} aria-current={i === 0}>
        <span className="slick-dot-icon" aria-hidden="true" />
        <span className="slick-sr-only">
          <FormattedMessage id="Go to slide" defaultMessage="Go to slide" />{' '}
          {i + 1}
        </span>
      </button>
    ),
    appendDots: (dots) => (
      <ul ref={dots_parent} className={'slick-dots'}>
        {dots}
      </ul>
    ),
    afterChange: () => {
      const dots = dots_parent.current;
      if (dots) {
        dots.querySelectorAll('.slider-dots-button').forEach(function (el) {
          el.setAttribute(
            'aria-current',
            el.parentElement.className === 'slick-active',
          );
        });
      }
    },
    responsive: [
      {
        breakpoint: tabletBreakpoint,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: mobileLargeBreakpoint,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: mobileBreakpoint,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <ResponsiveContainer>
      {({ parentWidth }) =>
        parentWidth ? (
          <div
            className="cards-carousel"
            style={{ width: `${parentWidth}px`, margin: '0 auto' }}
            role={'region'}
            aria-label={'carousel'}
          >
            <Slider {...settings} ref={slider}>
              {items.map((item, index) => (
                <UniversalCard
                  key={`card-${block}-${index}`}
                  {...rest}
                  block={block}
                  item={item}
                />
              ))}
            </Slider>
          </div>
        ) : null
      }
    </ResponsiveContainer>
  );
};

CardsCarousel.schemaEnhancer = (args) => {
  const { schema } = args;

  schema.fieldsets.splice(1, 0, {
    id: 'carousel',
    title: intl.formatMessage(messages.Carousel),
    fields: ['slidesToShow', 'slidesToScroll'],
  });

  return {
    ...schema,
    // fieldsets: [...schema.fieldsets, ,],
    properties: {
      ...schema.properties,
      slidesToShow: {
        title: intl.formatMessage(messages.SlidesToShow),
        type: 'number',
        default: 4,
        minimum: 1,
      },
      slidesToScroll: {
        title: intl.formatMessage(messages.SlidesToScroll),
        type: 'number',
        default: 1,
        minimum: 1,
      },
    },
  };
};

export default CardsCarousel;
