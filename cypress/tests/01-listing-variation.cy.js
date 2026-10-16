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

  it('Add Block: Listing variation', () => {
    setPageTitle('Listing Block Demo');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Test Headline');
    selectListingVariation('Listing');
    savePage();

    createChildDocuments(['Page 1']);

    cy.visit('/cypress/my-page');
    cy.contains('.documentFirstHeading', 'Listing Block Demo');
    cy.contains('.headline', 'Test Headline');
    cy.get('.block.listing').should('exist');
    cy.contains('Page 1');
  });
});
