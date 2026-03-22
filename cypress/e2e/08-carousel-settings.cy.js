import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
  clickSidebarTab,
  createChildDocuments,
  editPage,
  openListingBlock,
  savePage,
  selectListingVariation,
  setPageTitle,
} from '../support/listingBlock';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Carousel settings', () => {
    setPageTitle('Carousel Settings Demo');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Carousel Headline');
    selectListingVariation('Carousel');
    savePage();

    createChildDocuments(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5']);

    editPage();
    openListingBlock();
    clickSidebarTab('Carousel');
    cy.get('#field-slidesToShow:visible').clear().type('3');
    cy.get('#field-slidesToScroll:visible').clear().type('2');
    savePage();

    cy.get('.cards-carousel').should('exist');
    cy.get('button.slider-dots-button').should('have.length.greaterThan', 1);
    cy.get('button[aria-label="Next slide"]').click({ force: true });
    cy.contains('Page 5');
  });
});
