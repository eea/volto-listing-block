export const setPageTitle = (title) => {
  cy.clearSlateTitle();
  cy.getSlateTitle().type(title);
  cy.contains('.documentFirstHeading', title);
};

export const addBlock = (search, buttonClass = search) => {
  cy.get('.ui.basic.icon.button.block-add-button:visible').first().click();
  cy.get(".blocks-chooser .ui.form .field.searchbox input[type='text']")
    .should('be.visible')
    .clear()
    .type(search);
  cy.get(`.blocks-chooser .button.${buttonClass}`).click({ force: true });
};

export const savePage = (path = '/cypress/my-page') => {
  cy.get('#toolbar-save').click();
  cy.url().should('eq', `${Cypress.config().baseUrl}${path}`);
};

export const editPage = (path = '/cypress/my-page') => {
  cy.visit(path);
  cy.get('.edit').click();
};

export const openListingBlock = () => {
  cy.get('.block-editor-listing').last().click({ force: true });
};

export const selectListingVariation = (label) => {
  cy.get('.inline.field.field-wrapper-variation .react-select__control').click({
    force: true,
  });
  cy.contains('.react-select__option', label).click({ force: true });
};

export const clickSidebarTab = (label) => {
  cy.contains('.ui.attached.tabular.menu .item', label).click({ force: true });
};

export const createChildDocuments = (titles) => {
  titles.forEach((contentTitle, index) => {
    cy.createContent({
      contentType: 'Document',
      contentId: `page-${index + 1}`,
      contentTitle,
      path: 'cypress/my-page',
    });
  });
};
