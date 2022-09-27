import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import loadable from '@loadable/component';

import UniversalCard from '@eeacms/volto-listing-block/components/UniversalCard/UniversalCard';
import ResponsiveContainer from '@eeacms/volto-listing-block/components/ResponsiveContainer';
import { CardStylingSchemaEnhancer } from '../schema';

const Slider = loadable(() => import('react-slick'));

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
    dots: false,
    infinite: true,
    arrows: false,
    lazyLoad: 'progressive',
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

  return (
    <ResponsiveContainer>
      {({ parentWidth }) =>
        parentWidth ? (
          <div
            className="cards-carousel"
            style={{ width: `${parentWidth}px`, margin: '0 auto' }}
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
            {items.length > settings.slidesToShow && <Arrows slider={slider} />}
          </div>
        ) : null
      }
    </ResponsiveContainer>
  );
};

CardsCarousel.schemaEnhancer = (args) => {
  const schema = UniversalCard.schemaEnhancer(args);

  schema.fieldsets.splice(1, 0, {
    id: 'carousel',
    title: 'Carousel',
    fields: ['slidesToShow', 'slidesToScroll'],
  });

  return {
    ...schema,
    // fieldsets: [...schema.fieldsets, ,],
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

CardsCarousel.styleSchemaEnhancer = ({ schema, intl }) => {
  return CardStylingSchemaEnhancer({ schema });
};

export default CardsCarousel;
