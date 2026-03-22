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

const setVisibleNumberField = (fieldId, value) => {
  cy.get(`[id^="${fieldId}"]:visible`).clear().type(`${value}`);
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
    cy.get('[id^="field-urlTemplate"]:visible').type('/read-more');
    savePage();

    createChildDocuments(['Page 1', 'Page 2']);

    cy.visit('/cypress/my-page');
    cy.get('.items.imageOnLeft-items .left-image-card').should('exist');

    editPage();
    openListingBlock();
    cy.contains('Image on left').click({ force: true });
    cy.contains('Image on right').click({ force: true });
    savePage();

    cy.get('.items.imageOnRight-items .right-image-card').should('exist');

    editPage();
    openListingBlock();
    cy.contains('Image on right').click({ force: true });
    cy.contains('Listing Item').click({ force: true });
    cy.contains('label', 'Publication date').click({ force: true });
    setVisibleNumberField('field-maxTitle', 3);
    setVisibleNumberField('field-maxDescription', 3);
    cy.get('body').then(($body) => {
      if ($body.find('label:contains("Image on left")').length) {
        cy.contains('label', 'Image on left').click({ force: true });
      }
    });
    savePage();

    cy.get('.items.item-items .u-item.listing-item').should('exist');

    editPage();
    openListingBlock();
    cy.contains('Listing Item').click({ force: true });
    cy.contains('Search Item').click({ force: true });
    savePage();

    cy.get('.items.searchItem-items .result-item').should('exist');

    editPage();
    openListingBlock();
    cy.contains('Search Item').click({ force: true });
    cy.contains('Simple Item').click({ force: true });
    savePage();

    cy.get('.items.simpleItem-items .simple-listing-item').should('exist');
  });
});
