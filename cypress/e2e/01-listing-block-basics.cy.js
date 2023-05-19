import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Empty', () => {
    // Change page title
    cy.get('[contenteditable=true]').first().click();

    cy.get('[contenteditable=true]').first().clear();

    cy.get('[contenteditable=true]').first().type('Listing Block Demo');

    cy.get('.documentFirstHeading').contains('Listing Block Demo');

    cy.get('[contenteditable=true]').first().type('{enter}');

    // Add listing block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get(".blocks-chooser .ui.form .field.searchbox input[type='text']").type(
      'listing',
    );
    cy.get('.button.listing').click({ force: true });

    cy.contains('Add criteria').click();
    cy.get('.react-select__menu').contains('Creator').click();

    // Save page
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // Create a page
    cy.createContent({
      contentType: 'Document',
      contentId: 'page-1',
      contentTitle: 'Page 1',
      path: 'cypress/my-page',
    });

    // Navigate to that page
    cy.visit('cypress/my-page/page-1');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page/page-1');

    cy.get('.edit').click();

    cy.get('[contenteditable=true]').first().click();

    cy.get('[contenteditable=true]').first().clear();

    cy.get('[contenteditable=true]').first().type('Page with Description');

    cy.get('.documentFirstHeading').contains('Page with Description');

    cy.get('[contenteditable=true]').first().type('{enter}');

    // Add description block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get(".blocks-chooser .ui.form .field.searchbox input[type='text']").type(
      'description',
    );
    cy.get('.button.description').click();

    // Add some text to the description block
    cy.get('.documentDescription').click().type('lorem ipsum dolor sit amet');

    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // The page view should contain our changes
    cy.contains('Listing Block Demo');
    cy.get('.block.listing');
    cy.get('.listing-item').contains('Cypress');
    cy.get('.listing-item .listing-body').contains('Page with Description');
    cy.get('.listing-item .listing-body').contains(
      'lorem ipsum dolor sit amet',
    );
  });
});
