import React from 'react';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Accordion } from 'semantic-ui-react';

import AnimateHeight from 'react-animate-height';
import { Icon } from '@plone/volto/components';

import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';

const AccordionBlock = ({ items }) => {
  const itemsLength = items.length;
  const [activeIndex, setActiveIndex] = React.useState([]);
  const [activePanel, setActivePanel] = React.useState([]);

  const isExclusive = (id) => {
    return activePanel.includes(id);
  };
  const handleClick = (e, itemProps) => {
    const { index, id } = itemProps;

    const newIndex =
      activeIndex.indexOf(index) === -1
        ? [...activeIndex, index]
        : activeIndex.filter((item) => item !== index);
    const newPanel =
      activePanel.indexOf(id) === -1
        ? [...activePanel, id]
        : activePanel.filter((item) => item !== id);
    handleActiveIndex(newIndex, newPanel);
  };

  const handleActiveIndex = (index, id) => {
    setActiveIndex(index);
    setActivePanel(id);
  };
  return itemsLength > 0 ? (
    <div>
      {items.map((item, index) => {
        const id = item.id;
        const active = isExclusive(id);
        return (
          <Accordion key={id} id={id} exclusive={false}>
            <React.Fragment>
              <Accordion.Title
                active={active}
                aria-expanded={active}
                index={index}
                onClick={(e) => handleClick(e, { index, id })}
                onKeyDown={(e) => {
                  if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    handleClick(e, { index, id });
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {active ? (
                  <Icon size={'48px'} name={upSVG} />
                ) : (
                  <Icon size={'48px'} name={downSVG} />
                )}
                <span>{item?.title}</span>
              </Accordion.Title>
              <AnimateHeight
                animateOpacity
                duration={500}
                height={active ? 'auto' : 0}
              >
                <Accordion.Content active={active}>
                  {item.description}
                </Accordion.Content>
              </AnimateHeight>
            </React.Fragment>
          </Accordion>
        );
      })}
    </div>
  ) : null;
};

export default AccordionBlock;
