import { setupBeforeEach, tearDownAfterEach } from '../support';

describe('Blocks Tests', () => {
  beforeEach(setupBeforeEach);
  afterEach(tearDownAfterEach);

  it('Add Block: Empty', () => {
    // without this the clear command below does nothing sometimes
    cy.wait(500);

    // Change page title
    cy.get('[contenteditable=true]').first().clear();

    cy.get('[contenteditable=true]').first().type('My Add-on Page');

    cy.get('.documentFirstHeading').contains('My Add-on Page');

    cy.get('[contenteditable=true]').first().type('{enter}');

    // Add block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .title').contains('Common').click();
    cy.get('.content.active.common .button.listing')
      .contains('Listing')
      .click();

    // Select Custom summary Variation
    cy.get('#field-variation').click().contains('Cards gallery').click();
    cy.get('.query-widget #field-query-0-querystring').click();
    cy.get('.react-select__menu').contains('Creator').first().click();
    cy.get('.field.query-sort-on-widget #select-listingblock-sort-on').click();
    cy.get('.react-select__menu').contains('Creator').click();

    // Test for switches
    cy.contains('Gallery').click();

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // then the page view should contain our changes
    cy.contains('My Add-on Page');
  });
});
