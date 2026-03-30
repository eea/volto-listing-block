import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import { addBlock, savePage, setPageTitle } from '../support/listingBlock';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Item', () => {
    setPageTitle('Item Block Demo');

    addBlock('item');
    cy.get('.item div[role="textbox"]').click({ force: true }).type('Item body');
    cy.get('.field-attached-image .ui.input input').should('exist');

    cy.get('#field-assetType .react-select__control').click({ force: true });
    cy.contains('#field-assetType .react-select__option', 'Icon').click({
      force: true,
    });
    cy.get('#field-icon').click({ force: true }).type('alarm');
    savePage();

    cy.contains('Item Block Demo');
    cy.get('.ui.items.unstackable.row i.alarm.icon').should('exist');
  });
});
