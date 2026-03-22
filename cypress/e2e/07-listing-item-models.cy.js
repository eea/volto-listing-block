import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
  clickSidebarTab,
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
    selectListingVariation('Listing');
    cy.contains('Card (default)').click({ force: true });
    cy.contains('Image on left').click({ force: true });
    clickSidebarTab('Styling');
    cy.get('body').then(($body) => {
      if ($body.find('[id^="field-objectPosition"]:visible').length) {
        cy.get('[id^="field-objectPosition"]:visible').click({ force: true });
        cy.contains('.react-select__option', 'Right').click({ force: true });
      }
    });
    clickSidebarTab('Default');
    cy.contains('label', 'Show tags').click({ force: true });
    cy.contains('label', 'Show action').click({ force: true });
    cy.get('body').then(($body) => {
      if ($body.find('[id^="field-urlTemplate"]:visible').length) {
        cy.get('[id^="field-urlTemplate"]:visible').type('/read-more');
      }
    });
    savePage();

    createDocuments('listing-model-page', ['Page 1', 'Page 2']);

    cy.visit('/cypress/my-page');
    cy.get('.items.imageOnLeft-items .left-image-card').should('exist');

    updateListingBlock((block) => ({
      ...block,
      itemModel: {
        ...block.itemModel,
        '@type': 'imageOnRight',
      },
    }));

    cy.visit('/cypress/my-page');

    cy.get('.items.imageOnRight-items .right-image-card').should('exist');

    updateListingBlock((block) => ({
      ...block,
      itemModel: {
        ...block.itemModel,
        '@type': 'item',
        hasDate: true,
        hasDescription: true,
        maxTitle: 3,
        maxDescription: 3,
        hasImage: true,
        imageOnRightSide: true,
      },
    }));

    cy.visit('/cypress/my-page');

    cy.get('.items.item-items .u-item.listing-item .wrapper.right-image').should(
      'exist',
    );

    updateListingBlock((block) => ({
      ...block,
      itemModel: {
        ...block.itemModel,
        '@type': 'searchItem',
        hasImage: true,
        imageOnRightSide: true,
      },
    }));

    cy.visit('/cypress/my-page');

    cy.get('.items.searchItem-items .result-item .wrapper.right-image').should(
      'exist',
    );

    updateListingBlock((block) => ({
      ...block,
      itemModel: {
        ...block.itemModel,
        '@type': 'simpleItem',
        maxTitle: 3,
        hasMetaType: true,
      },
    }));

    cy.visit('/cypress/my-page');

    cy.get('.items.simpleItem-items .simple-listing-item').should('exist');
  });
});
