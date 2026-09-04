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

  it('Add Block: Carousel variation', () => {
    setPageTitle('Listing Block Demo');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Test Headline');
    selectListingVariation('Carousel');
    savePage();

    createChildDocuments(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5']);

    cy.visit('/cypress/my-page');
    cy.contains('.documentFirstHeading', 'Listing Block Demo');
    cy.contains('.headline', 'Test Headline');
    cy.get('.cards-carousel').should('exist');
    cy.get('button.slider-dots-button').should('have.length.greaterThan', 1);
    cy.get('button[aria-label="Next slide"]').click({ force: true });
    cy.contains('Page 5');
  });
});
