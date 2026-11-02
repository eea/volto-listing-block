import { slateAfterEach, slateBeforeEach } from '../support/e2e';
import {
  addBlock,
  openListingBlock,
  savePage,
  selectListingVariation,
  setPageTitle,
  updateListingBlock,
} from '../support/listingBlock';

const createDocuments = (prefix, titles) => {
  const uniquePrefix = `${prefix}-${Date.now()}`;

  titles.forEach((contentTitle, index) => {
    cy.createContent({
      contentType: 'Document',
      contentId: `${uniquePrefix}-${index + 1}`,
      contentTitle,
      path: 'cypress/my-page',
    });
  });
};

const LISTING_CARD = '.block.listing .ui.card.u-card';
const CARD_LINK = `${LISTING_CARD} a.header-link`;
const CTA = `${LISTING_CARD} a.card-cta`;
const MODAL = '.visualization-card-modal';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Card links and the content popup', () => {
    setPageTitle('Card Links');

    addBlock('listing');
    openListingBlock();
    cy.get('#field-headline').click({ force: true }).type('Linked Cards');
    selectListingVariation('Grid');
    savePage();

    createDocuments('card-links-page', ['Page 1', 'Page 2']);

    // A card whose action was switched off: the CTA URL template that is
    // still stored does not apply, the card leads to its content.
    updateListingBlock((block) => ({
      ...block,
      itemModel: {
        '@type': 'card',
        imagePosition: 'top',
        enableCTAPopup: true,
        callToAction: {
          enable: false,
          label: 'Read more',
          urlTemplate: '/read-more',
        },
      },
    }));

    cy.viewport(1440, 900);
    cy.visit('/cypress/my-page');

    cy.get(CARD_LINK).should('have.length', 2);
    cy.get(CARD_LINK)
      .first()
      .invoke('attr', 'href')
      .should('not.contain', '/read-more');
    cy.get(CTA).should('not.exist');

    // without a CTA there is no popup either, the card opens its content
    cy.get(CARD_LINK)
      .first()
      .invoke('attr', 'href')
      .then((href) => {
        cy.get(CARD_LINK).first().click();
        cy.location('pathname').should('eq', href);
        cy.get(MODAL).should('not.exist');
      });

    // With the CTA on, the title and the image navigate to the content and
    // only the CTA opens the content popup.
    updateListingBlock((block) => ({
      ...block,
      itemModel: {
        ...block.itemModel,
        callToAction: {
          enable: true,
          label: 'Read more',
          urlTemplate: '$URL',
        },
      },
    }));

    cy.visit('/cypress/my-page');

    cy.get(CTA).should('have.length', 2);
    cy.get(`${LISTING_CARD} a.image`)
      .first()
      .invoke('attr', 'href')
      .should('not.contain', '@@');

    cy.get(CARD_LINK)
      .first()
      .invoke('attr', 'href')
      .then((href) => {
        cy.get(CARD_LINK).first().click();
        cy.location('pathname').should('eq', href);
        cy.get(MODAL).should('not.exist');
      });

    cy.visit('/cypress/my-page');
    cy.get(CTA).first().click();
    cy.get(MODAL).should('be.visible');
  });
});
