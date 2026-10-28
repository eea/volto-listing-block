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

  it('Add Block: Gallery grid size', () => {
    setPageTitle('Gallery Settings Demo');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Gallery Headline');
    selectListingVariation('Gallery');
    savePage();

    createDocuments('gallery-page', ['Page 1', 'Page 2', 'Page 3', 'Page 4']);

    updateListingBlock((block) => ({
      ...block,
      gridSize: 'four',
    }));

    cy.visit('/cypress/my-page');

    cy.get('.ui.fluid.four.cards').should('exist');
    cy.contains('Page 4');
  });
});
