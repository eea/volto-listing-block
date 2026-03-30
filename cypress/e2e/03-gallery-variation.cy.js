import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
  createChildDocuments,
  openListingBlock,
  savePage,
  selectListingVariation,
  setPageTitle,
} from '../support/listingBlock';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Gallery variation', () => {
    setPageTitle('Listing Block Demo');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Test Headline');
    selectListingVariation('Gallery');
    savePage();

    createChildDocuments(['Page 1', 'Page 2', 'Page 3', 'Page 4']);

    cy.visit('/cypress/my-page');
    cy.contains('.documentFirstHeading', 'Listing Block Demo');
    cy.contains('.headline', 'Test Headline');
    cy.get('.ui.fluid.three.cards').should('exist');
    cy.contains('Page 4');
  });
});
