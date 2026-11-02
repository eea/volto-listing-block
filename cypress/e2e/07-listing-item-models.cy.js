import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
  openListingBlock,
  savePage,
  selectListingVariation,
  setPageTitle,
  updateListingBlock,
} from '../support/listingBlock';

// The block is saved from the editor with the current card model. The steps
// below store legacy card templates, as saved before the card controls, so
// the controls introduced since are left out.
const NEW_MODEL_FIELDS = [
  'imagePosition',
  'contentMode',
  'size',
  'hasHeadMeta',
  'hasBenchmarkLevel',
  'elementsOrder',
];

const legacyItemModel = (itemModel = {}, fields) => ({
  ...Object.fromEntries(
    Object.entries(itemModel).filter(
      ([key]) => !NEW_MODEL_FIELDS.includes(key),
    ),
  ),
  ...fields,
});

const createDocuments = (prefix, titles) => {
  const uniquePrefix = `${prefix}-${Date.now()}`;

  titles.forEach((contentTitle, index) => {
    cy.createContent({
      contentType: 'Document',
      contentId: `${uniquePrefix}-${index + 1}`,
      contentTitle,
      path: 'cypress/my-page',
    });
  });
};

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Listing item models', () => {
    setPageTitle('Listing Item Models');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Advanced Listing');
    selectListingVariation('List');
    savePage();

    updateListingBlock((block) => ({
      ...block,
      itemModel: legacyItemModel(block.itemModel, {
        '@type': 'imageOnLeft',
        hasTags: true,
        callToAction: {
          ...(block.itemModel?.callToAction || {}),
          enable: true,
          urlTemplate: '/read-more',
        },
        styles: {
          ...(block.itemModel?.styles || {}),
          objectPosition: 'right',
        },
      }),
    }));

    createDocuments('listing-model-page', ['Page 1', 'Page 2']);

    // List renders every card model as a list item, with the image on the
    // same side as the legacy card template
    cy.visit('/cypress/my-page');
    cy.get('.items.item-items .u-item.listing-item .wrapper.left-image').should(
      'exist',
    );

    updateListingBlock((block) => ({
      ...block,
      itemModel: legacyItemModel(block.itemModel, {
        '@type': 'imageOnRight',
      }),
    }));

    cy.visit('/cypress/my-page');

    cy.get(
      '.items.item-items .u-item.listing-item .wrapper.right-image',
    ).should('exist');

    updateListingBlock((block) => ({
      ...block,
      itemModel: legacyItemModel(block.itemModel, {
        '@type': 'item',
        hasDate: true,
        hasDescription: true,
        maxTitle: 3,
        maxDescription: 3,
        hasImage: true,
        imageOnRightSide: true,
      }),
    }));

    cy.visit('/cypress/my-page');

    cy.get(
      '.items.item-items .u-item.listing-item .wrapper.right-image',
    ).should('exist');

    updateListingBlock((block) => ({
      ...block,
      itemModel: legacyItemModel(block.itemModel, {
        '@type': 'searchItem',
        hasImage: true,
        imageOnRightSide: true,
      }),
    }));

    cy.visit('/cypress/my-page');

    cy.get('.items.searchItem-items .result-item .wrapper.right-image').should(
      'exist',
    );

    updateListingBlock((block) => ({
      ...block,
      itemModel: legacyItemModel(block.itemModel, {
        '@type': 'simpleItem',
        maxTitle: 3,
        hasMetaType: true,
      }),
    }));

    cy.visit('/cypress/my-page');

    cy.get('.items.simpleItem-items .simple-listing-item').should('exist');
  });

  it('Add Block: Listing without a card model', () => {
    setPageTitle('Listing Without Card Model');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Plain Listing');
    selectListingVariation('List');
    savePage();

    // a listing block saved before the card controls existed: Volto stores
    // only the values the editor touched, so the card model is missing
    updateListingBlock((block) => {
      const { itemModel, ...rest } = block;
      return rest;
    });

    createDocuments('listing-no-model-page', ['Page 1', 'Page 2']);

    cy.visit('/cypress/my-page');

    // the date and the description are shown, as the card elements widget
    // says, with the title and the image leading to the content
    cy.get('.items.item-items .u-item.listing-item .listing-date').should(
      'exist',
    );
    cy.get(
      '.items.item-items .u-item.listing-item .listing-description',
    ).should('exist');
    cy.get('.items.item-items .u-item.listing-item a.header-link').should(
      'have.attr',
      'href',
    );
  });
});
