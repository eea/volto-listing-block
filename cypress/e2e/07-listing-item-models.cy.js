import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
  openListingBlock,
  savePage,
  selectListingVariation,
  setPageTitle,
} from '../support/listingBlock';

const updateListingBlock = (updater) => {
  const apiUrl = Cypress.env('API_PATH') || 'http://localhost:8080/Plone';
  const auth = { user: 'admin', pass: 'admin' };

  cy.request({
    method: 'GET',
    url: `${apiUrl}/cypress/my-page`,
    headers: { Accept: 'application/json' },
    auth,
  }).then(({ body }) => {
    const listingBlockId = Object.keys(body.blocks).find(
      (id) => body.blocks[id]['@type'] === 'listing',
    );

    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/cypress/my-page`,
      headers: { Accept: 'application/json' },
      auth,
      body: {
        blocks: {
          ...body.blocks,
          [listingBlockId]: updater(body.blocks[listingBlockId]),
        },
        blocks_layout: body.blocks_layout,
      },
    });
  });
};

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
});
