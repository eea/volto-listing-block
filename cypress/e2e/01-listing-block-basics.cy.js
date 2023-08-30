import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Listing variation', () => {
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

    cy.get('.documentFirstHeading').contains('Listing Block Demo');
    cy.get('.headline').contains('Test Headline');
    cy.get(
      '.block.listing .items.imageOnLeft-items .card.max-2-lines.title-max-2-lines.has--object-position--right.item-card.left-image-card',
    ).should('exist');

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
    cy.get(
      '.inline.field.help.field-wrapper-subjects .react-select__value-container',
    )
      .click({ force: true })
      .type('test');
    cy.get('.react-select__option.react-select__option--is-focused').click({
      force: true,
    });

    cy.get('.documentDescription').contains('lorem ipsum dolor sit amet');
    cy.get('.react-select__multi-value__label').contains('test');
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // The page view should contain our changes
    cy.contains('Listing Block Demo');
    cy.get('.block.listing');
    cy.get('.header-link').contains('Cypress');
    cy.get('.header-link').contains('Page with Description');
    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();

    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Image on left').click();
    cy.contains('Image on right').click();
    cy.get('.inline.field.field-wrapper-hasTags-8-itemModel input').click({
      force: true,
    });
    cy.get(
      '.inline.field.field-wrapper-enable-0-callToAction-9-itemModel input',
    ).click({ force: true });
    cy.get('#field-urlTemplate-2-callToAction-9-itemModel')
      .click({ force: true })
      .type('http://localhost:3000');

    cy.get(
      '.inline.field.field-wrapper-hasTags-8-itemModel .ui.checked.checkbox input',
    );
    cy.get(
      '.inline.field.field-wrapper-enable-0-callToAction-9-itemModel .ui.checked.checkbox input',
    );
    cy.get(
      'input[value="http://localhost:3000"]#field-urlTemplate-2-callToAction-9-itemModel',
    );

    cy.get('.ui.attached.tabular.menu').contains('Styling').click();
    cy.get(
      '.ui.bottom.attached.segment.active.tab .inline.field.help input[type="checkbox"]',
    )
      .eq(0)
      .click({
        force: true,
      });
    cy.get(
      '.ui.bottom.attached.segment.active.tab .inline.field.help.text .ui.input input[type="text"]',
    )
      .click({ force: true })
      .type('test');

    cy.get(
      '.ui.bottom.attached.segment.active.tab .inline.field.help .ui.checked.checkbox input[type="checkbox"]',
    );
    cy.get(
      '.ui.bottom.attached.segment.active.tab .inline.field.help.text .ui.input input[value="test"]',
    );

    cy.get('#toolbar-save').click();
    cy.get('.items.imageOnRight-items');
    cy.get(
      '.ui.fluid.card.u-card.max-2-lines.title-max-2-lines.inverted.has--object-position--right.test.item-card.right-image-card',
    );

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Image on right').click({ force: true });
    cy.contains('Image Card').click();
    cy.contains('Image Card');
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

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
  it('Add Block: Carousel variation', () => {
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
    cy.get('.button.listing').click({
      force: true,
    });
    cy.get('#field-headline').click({ force: true }).type('Test Headline');
    cy.get(
      '.inline.field.field-wrapper-variation .ui.grid .react-select__value-container',
    ).click();
    cy.get('.react-select__option').contains('Carousel').click();

    cy.get('.title').contains('Carousel').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Card (default)').click();
    cy.contains('Image Card').click();
    cy.get('.ui.attached.tabular.menu').contains('Styling').click();
    cy.get('#field-objectPosition-5-styles-0-itemModel').click();
    cy.get('.react-select__option').contains('right').click();

    // Save page
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.get('.documentFirstHeading').contains('Listing Block Demo');
    cy.get('.headline').contains('Test Headline');

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
    cy.get(
      '.inline.field.help.field-wrapper-subjects .react-select__value-container',
    )
      .click({ force: true })
      .type('test');
    cy.get('.react-select__option.react-select__option--is-focused').click({
      force: true,
    });

    cy.get('.documentDescription').contains('lorem ipsum dolor sit amet');
    cy.get('.react-select__multi-value__label').contains('test');
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-2',
      contentTitle: 'Page 2',
      path: 'cypress/my-page',
    });

    // Navigate to that page
    cy.visit('cypress/my-page/page-2');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page/page-2');

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
    cy.get(
      '.inline.field.help.field-wrapper-subjects .react-select__value-container',
    )
      .click({ force: true })
      .type('test');
    cy.get('.react-select__option.react-select__option--is-focused').click({
      force: true,
    });

    cy.get('.documentDescription').contains('lorem ipsum dolor sit amet');
    cy.get('.react-select__multi-value__label').contains('test');
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-3',
      contentTitle: 'Page 3',
      path: 'cypress/my-page',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-4',
      contentTitle: 'Page 4',
      path: 'cypress/my-page',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-5',
      contentTitle: 'Page 5',
      path: 'cypress/my-page',
    });

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.get('button.slider-dots-button').eq(1).click();
    cy.get('button[aria-label="Next slide"]').click();

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Carousel').click();
    cy.get('#field-slidesToShow').type('{downArrow}{downArrow}{downArrow}');
    cy.get('#field-slidesToScroll').type('{upArrow}');
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
  });
  it('Add Block: Gallery variation', () => {
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
    cy.get('.button.listing').click({
      force: true,
    });
    cy.get('#field-headline').click({ force: true }).type('Test Headline');
    cy.get(
      '.inline.field.field-wrapper-variation .ui.grid .react-select__value-container',
    ).click();
    cy.get('.react-select__option').contains('Gallery').click();

    cy.get('.title').contains('Gallery').click();
    cy.get('.title').contains('Card').click();
    cy.contains('Card (default)').click();
    cy.contains('Image Card').click();
    cy.get('.ui.attached.tabular.menu').contains('Styling').click();
    cy.get('#field-objectPosition-5-styles-0-itemModel').click();
    cy.get('.react-select__option').contains('right').click();

    // Save page
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.get('.documentFirstHeading').contains('Listing Block Demo');
    cy.get('.headline').contains('Test Headline');

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
    cy.get(
      '.inline.field.help.field-wrapper-subjects .react-select__value-container',
    )
      .click({ force: true })
      .type('test');
    cy.get('.react-select__option.react-select__option--is-focused').click({
      force: true,
    });

    cy.get('.documentDescription').contains('lorem ipsum dolor sit amet');
    cy.get('.react-select__multi-value__label').contains('test');
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-2',
      contentTitle: 'Page 2',
      path: 'cypress/my-page',
    });

    // Navigate to that page
    cy.visit('cypress/my-page/page-2');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page/page-2');

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
    cy.get(
      '.inline.field.help.field-wrapper-subjects .react-select__value-container',
    )
      .click({ force: true })
      .type('test');
    cy.get('.react-select__option.react-select__option--is-focused').click({
      force: true,
    });

    cy.get('.documentDescription').contains('lorem ipsum dolor sit amet');
    cy.get('.react-select__multi-value__label').contains('test');
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-3',
      contentTitle: 'Page 3',
      path: 'cypress/my-page',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-4',
      contentTitle: 'Page 4',
      path: 'cypress/my-page',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'page-5',
      contentTitle: 'Page 5',
      path: 'cypress/my-page',
    });

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().click();
    cy.contains('Test Headline').click();
    cy.get('.title').contains('Gallery').click();
    cy.get('#blockform-fieldset-cardsGallery .react-select__control').click();
    cy.get('.react-select__menu-list').contains('Four').click({ force: true });
    cy.get('#toolbar-save').click();

    cy.visit('/cypress/my-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
  });
  it('Add Block: Item', () => {
    // Change page title
    cy.get('[contenteditable=true]').first().click();
    cy.get('[contenteditable=true]').first().clear();
    cy.get('[contenteditable=true]').first().type('Listing Block Demo');
    cy.get('.documentFirstHeading').contains('Listing Block Demo');
    cy.get('[contenteditable=true]').first().type('{enter}');

    // Add listing block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get(".blocks-chooser .ui.form .field.searchbox input[type='text']").type(
      'item',
    );
    cy.get('.blocks-chooser .button.item').click({
      force: true,
    });
    cy.get('.item div[role="textbox"]').click({ force: true }).type('test');

    cy.get;
    cy.get('#field-assetType .react-select__control').click({ force: true });
    cy.get('#field-assetType .react-select__option')
      .contains('Image')
      .click({ force: true });
    cy.get('#field-image').click({ force: true }).type('test');

    cy.get('#field-theme').click({ force: true }).type('Test Theme');

    // Save page
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    cy.get('.edit').click();
    cy.get('[contenteditable=true]').first().type('{enter}');
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get(".blocks-chooser .ui.form .field.searchbox input[type='text']").type(
      'item',
    );
    cy.get('.blocks-chooser .button.item').click({
      force: true,
    });
    cy.get('.item .slate-editor.selected div[role="textbox"]').click({
      force: true,
    });
    cy.get('#field-assetType .react-select__control').click({ force: true });
    cy.get('#field-assetType .react-select__option')
      .contains('Icon')
      .click({ force: true });
    cy.get('#field-icon').click({ force: true }).type('test');

    cy.get('#field-theme').click({ force: true }).type('Test Theme');
  });
  it('Add Block: Teaser', () => {
    // Change page title
    cy.get('[contenteditable=true]').first().click();
    cy.get('[contenteditable=true]').first().clear();
    cy.get('[contenteditable=true]').first().type('Listing Block Demo');
    cy.get('.documentFirstHeading').contains('Listing Block Demo');
    cy.get('[contenteditable=true]').first().type('{enter}');

    // Add listing block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get(".blocks-chooser .ui.form .field.searchbox input[type='text']").type(
      'teaser',
    );
    cy.get('.blocks-chooser .button.teaser').click({
      force: true,
    });

    cy.get(
      '.ui.form #blockform-fieldset-default .field-wrapper-title input#field-title',
    )
      .click({ force: true })
      .type('Test Title');
    cy.get('#field-head_title').click({ force: true }).type('Test Head Title');
    cy.get('#blockform-fieldset-default #field-description')
      .click({ force: true })
      .type('Test Description');

    // Save page
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
  });
});
