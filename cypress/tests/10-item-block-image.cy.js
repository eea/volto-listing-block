import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import { addBlock, savePage, setPageTitle } from '../support/listingBlock';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Item image asset', () => {
    setPageTitle('Item Image Demo');
    cy.createContent({
      contentType: 'Image',
      contentId: 'cover-image',
      contentTitle: 'Cover Image',
      path: 'cypress/my-page',
    });

    addBlock('item');
    cy.get('.item div[role="textbox"]').click({ force: true }).type('Item body');
    cy.get('.field-attached-image .toolbar-inner .buttons .button')
      .first()
      .click({ force: true });
    cy.get('[aria-label="Select Cover Image"]').dblclick();
    cy.get('.field-attached-image .toolbar-inner .button.primary').click({
      force: true,
    });
    cy.get('.field-attached-image .preview img').should('exist');
    savePage();

    cy.get('.ui.items.unstackable.row img.ui.image').should('exist');
  });
});
