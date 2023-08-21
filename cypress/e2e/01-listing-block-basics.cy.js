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
    cy.get('#field-headline').click({ force: true }).type('Test Headline');
    cy.get(
      '.inline.field.field-wrapper-variation .ui.grid .react-select__value-container',
    ).click();
    cy.get('.react-select__option').contains('Listing').click();

    cy.contains('Test Headline').click();

    cy.contains('Add criteria').click();
    cy.get('.react-select__menu').contains('Creator').click();

    cy.get('.title').contains('Card').click();
    cy.contains('Card (default)').click();
    cy.contains('Image on left').click();
    cy.get('.ui.attached.tabular.menu').contains('Styling').click();
    cy.get('#field-objectPosition-5-styles-0-itemModel').click();
    cy.get('.react-select__option').contains('right').click();

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
    cy.get('#sidebar-metadata #effective-date').click();
    cy.get('tr td').contains(1).click({ force: true });
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // The page view should contain our changes
    cy.contains('Listing Block Demo');
    cy.get('.block.listing');
    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();

    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Image on left').click();
    cy.contains('Image on right').click();
    cy.get('#toolbar-save').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Image on right').click({ force: true });
    cy.contains('Image Card').click();
    cy.get('#toolbar-save').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Image Card').click();
    cy.contains('Listing Item').click();
    cy.get('.inline.field.field-wrapper-hasDate-2-itemModel input').click({
      force: true,
    });
    cy.get(
      '.inline.field.field-wrapper-imageOnRightSide-6-itemModel input',
    ).click({ force: true });
    cy.get('#field-maxTitle-1-itemModel')
      .click()
      .type('{downArrow}{downArrow}');
    cy.get('#field-maxDescription-4-itemModel')
      .click()
      .type('{downArrow}{downArrow}');
    cy.get('#toolbar-save').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.get('.inline.field.field-wrapper-hasImage-5-itemModel input').click({
      force: true,
    });
    cy.get('#toolbar-save').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Listing Item').click();
    cy.contains('Search Item').click();
    cy.get('#toolbar-save').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Search Item').click();
    cy.get('.inline.field.field-wrapper-hasImage-5-itemModel input').click({
      force: true,
    });
    cy.get(
      '.inline.field.field-wrapper-imageOnRightSide-6-itemModel input',
    ).click({ force: true });
    cy.get('#toolbar-save').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Search Item').click();
    cy.contains('Simple Item').click();
    cy.get('#toolbar-save').click();
  });
});
