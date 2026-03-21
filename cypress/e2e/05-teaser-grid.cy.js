import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import { addBlock, savePage, setPageTitle } from '../support/listingBlock';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: teaserGrid', () => {
    setPageTitle('Listing Block Demo');
    cy.createContent({
      contentType: 'Document',
      contentId: 'page-1',
      contentTitle: 'Page 1',
      path: 'cypress/my-page',
    });

    addBlock('teaser');
    cy.get('.block-editor-teaser').click({ force: true });
    cy.get(
      '.objectbrowser-field[aria-labelledby="fieldset-default-field-label-href"] button[aria-label="Open object browser"]',
    ).click();
    cy.get('[aria-label="Select Page 1"]').dblclick();
    cy.wait(500);
    cy.get('input[name="field-overwrite"]').check({ force: true });
    cy.get('#sidebar-properties input[name="title"]:visible')
      .clear()
      .type('Test Title');
    cy.get('#sidebar-properties input[name="head_title"]:visible')
      .clear()
      .type('Test Head Title');
    cy.get('#sidebar-properties textarea[name="description"]:visible')
      .clear()
      .type('Test Description');
    savePage();

    cy.get('.ui.card.u-card').should('exist');
    cy.contains('.ui.card.u-card .header', 'Test Title');
    cy.contains('.ui.card.u-card .meta', 'Test Head Title');
  });
});
