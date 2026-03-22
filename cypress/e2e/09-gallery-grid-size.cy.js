import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
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

  it('Add Block: Gallery grid size', () => {
    setPageTitle('Gallery Settings Demo');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Gallery Headline');
    selectListingVariation('Gallery');
    savePage();

    createChildDocuments(['Page 1', 'Page 2', 'Page 3', 'Page 4']);

    editPage();
    openListingBlock();
    cy.get('#blockform-fieldset-cardsGallery .react-select__control').click({
      force: true,
    });
    cy.contains('.react-select__menu-list', 'Four').click({ force: true });
    savePage();

    cy.get('.ui.fluid.four.cards').should('exist');
    cy.contains('Page 4');
  });
});
