import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { UniversalCard } from '@eeacms/volto-listing-block';
import config from '@plone/volto/registry';

const CardsGallery = ({
  block,
  items,
  gridSize,
  isEditMode,
  hasDate,
  hasDescription,
  ...rest
}) => {
  moment.locale(config.settings.dateLocale);
  return (
    <>
      {items && items.length > 0 && (
        <div className={`ui fluid ${gridSize || ''} cards`}>
          {items.map((item, i) => (
            <UniversalCard key={i} {...rest} block={block} item={item} />
          ))}
        </div>
      )}
    </>
  );
};

CardsGallery.schemaEnhancer = (args) => {
  const schema = UniversalCard.schemaEnhancer(args);
  // schema.fieldsets[0].fields.push('gridSize');
  schema.fieldsets.splice(1, 0, {
    id: 'cardsGallery',
    title: 'Gallery',
    fields: ['gridSize'],
  });

  schema.properties = {
    ...schema.properties,
    gridSize: {
      title: 'Grid Size',
      choices: [
        ['three', 'Three'],
        ['four', 'Four'],
      ],
      default: 'three',
      factory: 'Choice',
      type: 'string',
    },
  };
  return schema;
};

CardsGallery.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default CardsGallery;

// const makeTextBody = (item) => (
//   <Card.Content>
//     <Card.Meta>
//       {hasDate && item.effective && (
//         <span className="category">
//           {moment(item.effective).format('ll')}
//         </span>
//       )}
//     </Card.Meta>
//     <Card.Header>{item.title ? item.title : item.id}</Card.Header>
//     {hasDescription && (
//       <Card.Description>
//         <p>{item.description}</p>
//       </Card.Description>
//     )}
//   </Card.Content>
// );
//
// const makeImage = (item) => {
//   return (
//     <ConditionalLink className="image" item={item} condition={!isEditMode}>
//       <PreviewImage item={item} alt={item.title} />
//     </ConditionalLink>
//   );
// };
//
// <Card key={item['@id']} className={cx('centered', styles?.theme)}>
//   {makeImage(item)}
//   {makeTextBody(item)}
// </Card>

// import PreviewImage from '@eeacms/volto-listing-block/PreviewImage';
// import { ConditionalLink } from '@plone/volto/components';
// import { Card } from 'semantic-ui-react';
// import cx from 'classnames';
// styles,
// itemModel,
