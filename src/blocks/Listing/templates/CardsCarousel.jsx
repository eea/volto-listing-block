import React from 'react';
import Slider from 'react-slick';
import { Button, Icon } from 'semantic-ui-react';
import { UniversalCard } from '@eeacms/volto-listing-block';

const tabletBreakpoint = 768;
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

const Arrows = (props) => {
  const { slider = {} } = props;

  return (
    <>
      <Button
        aria-label="Previous slide"
        className="slider-arrow prev-arrow tablet or lower hidden"
        icon
        onClick={() => {
          if (slider.current) {
            slider.current.slickPrev();
          }
        }}
      >
        <Icon className="ri-arrow-left-s-line" />
      </Button>
      <Button
        aria-label="Next slide"
        className="slider-arrow next-arrow tablet or lower hidden"
        icon
        onClick={() => {
          if (slider.current) {
            slider.current.slickNext();
          }
        }}
      >
        <Icon className="ri-arrow-right-s-line" />
      </Button>
    </>
  );
};

const CardsCarousel = ({ block, items, ...rest }) => {
  const slider = React.useRef(null);
  const [settings] = React.useState({
    dots: true,
    infinite: true,
    arrows: false,
    slidesToShow: getSlidesToShow(items, rest.slidesToShow || 4),
    slidesToScroll: getSlidesToScroll(
      items,
      rest.slidesToShow || 4,
      rest.slidesToScroll || 1,
    ),
    responsive: [
      {
        breakpoint: tabletBreakpoint,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: mobileBreakpoint,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  });

  return rest.isEditMode ? (
    <div className="fluid-card-row">
      {items.map((item, index) => (
        <UniversalCard key={`card-${block}-${index}`} {...rest} item={item} />
      ))}
    </div>
  ) : (
    <div className="cards-carousel">
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
      {items.length > settings.slidesToShow && <Arrows slider={slider} />}
    </div>
  );
};

CardsCarousel.schemaEnhancer = (args) => {
  const schema = UniversalCard.schemaEnhancer(args);

  return {
    ...schema,
    fieldsets: [
      ...schema.fieldsets,
      {
        id: 'carousel',
        title: 'Carousel',
        fields: ['slidesToShow', 'slidesToScroll'],
      },
    ],
    properties: {
      ...schema.properties,
      slidesToShow: {
        title: 'Slides to show',
        type: 'number',
        default: 4,
        minimum: 1,
      },
      slidesToScroll: {
        title: 'Slides to scroll',
        type: 'number',
        default: 1,
        minimum: 1,
      },
    },
  };
};

export default CardsCarousel;
