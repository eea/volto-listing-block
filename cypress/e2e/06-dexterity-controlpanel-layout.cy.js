import { slateLayoutAfterEach, slateLayoutBeforeEach } from '../support/e2e';
import { addBlock, savePage } from '../support/listingBlock';

describe('ControlPanel: Dexterity Content-Types Layout', () => {
  beforeEach(slateLayoutBeforeEach);
  afterEach(slateLayoutAfterEach);

  it('Edit Blocks Layout for Book', () => {
    cy.visit('/controlpanel/dexterity-types');

    cy.get('a[href="/controlpanel/dexterity-types/book"]').should(
      'have.text',
      'book',
    );

    cy.visit('/controlpanel/dexterity-types/book/layout');
    cy.get('#page-controlpanel-layout').contains(
      'Can not edit Layout for book',
    );
    cy.get('#page-controlpanel-layout button').click();

    cy.wait(1000);
    cy.contains('a.item', 'Settings').click({ force: true });
    cy.get('input[id="field-placeholder"]').should('be.visible').type(
      'Book title',
    );
    cy.get('label[for="field-required"]').click();
    cy.get('label[for="field-fixed"]').click();

    cy.getSlate().click();
    addBlock('listing');
    cy.get('.block-editor-listing').click({ force: true });
    cy.get('.form .help .input').click({ force: true }).type('Helper Text');
    savePage('/controlpanel/dexterity-types/book/layout');

    cy.visit('/cypress');

    cy.get('button.add').click();
    cy.get('#toolbar-add-book').click();
    cy.get('.block.title').contains('Book title');

    cy.clearSlateTitle();
    cy.getSlateTitle().type('My First Book');
    cy.get('.documentFirstHeading').contains('My First Book');
    cy.get('.listing').contains('Helper Text');

    cy.get('.block-editor-listing').click();
    cy.get('.field-wrapper-headline .input').click().type('Headline');

    cy.get('#toolbar-save').click();
    cy.get('.documentFirstHeading').contains('My First Book');
    cy.get('.listing').contains('Headline');
  });
});
