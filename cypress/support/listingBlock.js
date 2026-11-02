export const setPageTitle = (title) => {
  cy.clearSlateTitle();
  cy.getSlateTitle().type(title);
  cy.contains('.documentFirstHeading', title);
};

export const addBlock = (search, buttonClass = search) => {
  cy.get('body').then(($body) => {
    if (!$body.find('.ui.basic.icon.button.block-add-button:visible').length) {
      cy.getSlate().click({ force: true });
    }
  });

  cy.get('.ui.basic.icon.button.block-add-button:visible')
    .first()
    .click({ force: true });
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

// Rewrites the listing block of a page through the API, so a spec can store
// the data of older versions of the block (e.g. a missing card model) without
// going through the sidebar.
export const updateListingBlock = (updater, path = '/cypress/my-page') => {
  const apiUrl = Cypress.env('API_PATH') || 'http://localhost:8080/Plone';
  const auth = { user: 'admin', pass: 'admin' };

  return cy
    .request({
      method: 'GET',
      url: `${apiUrl}${path}`,
      headers: { Accept: 'application/json' },
      auth,
    })
    .then(({ body }) => {
      const listingBlockId = Object.keys(body.blocks).find(
        (id) => body.blocks[id]['@type'] === 'listing',
      );

      cy.request({
        method: 'PATCH',
        url: `${apiUrl}${path}`,
        headers: { Accept: 'application/json' },
        auth,
        body: {
          blocks: {
            ...body.blocks,
            [listingBlockId]: updater(body.blocks[listingBlockId]),
          },
          blocks_layout: body.blocks_layout,
        },
      });
    });
};
