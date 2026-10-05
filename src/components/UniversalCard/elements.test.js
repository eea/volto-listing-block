import {
  CARD_ELEMENTS,
  ITEM_ELEMENTS,
  VISUALIZATION_ELEMENTS,
  getAvailableElements,
  getElementsOrder,
  getHiddenElements,
  splitFooter,
} from './elements';

describe('getElementsOrder', () => {
  it('uses the default card order', () => {
    expect(getElementsOrder({ '@type': 'card' })).toEqual(CARD_ELEMENTS);
    expect(getElementsOrder({})).toEqual(CARD_ELEMENTS);
  });

  it('uses the visualization order for the legacy bottom image', () => {
    expect(
      getElementsOrder({ '@type': 'card', imagePosition: 'bottom' }),
    ).toEqual(VISUALIZATION_ELEMENTS);
  });

  it('uses the stored order', () => {
    const elementsOrder = [
      'title',
      'image',
      'description',
      'date',
      'contentType',
      'benchmark',
      'cta',
      'tags',
    ];
    expect(getElementsOrder({ '@type': 'card', elementsOrder })).toEqual(
      elementsOrder,
    );
  });

  it('appends missing elements and drops unknown or duplicate ones', () => {
    expect(
      getElementsOrder({
        '@type': 'card',
        elementsOrder: ['description', 'foo', 'description', 'title'],
      }),
    ).toEqual([
      'description',
      'title',
      'image',
      'contentType',
      'date',
      'benchmark',
      'tags',
      'cta',
    ]);
  });

  it('leaves the image out for side images', () => {
    ['left', 'right'].forEach((imagePosition) => {
      expect(
        getElementsOrder({ '@type': 'card', imagePosition }),
      ).not.toContain('image');
    });
  });

  it('keeps a switched off image in the list, to switch it back on', () => {
    expect(
      getElementsOrder({ '@type': 'card', imagePosition: 'none' }),
    ).toContain('image');
  });

  it('uses the list item elements', () => {
    expect(getAvailableElements({ '@type': 'item' })).toEqual(ITEM_ELEMENTS);
    expect(
      getElementsOrder({
        '@type': 'item',
        elementsOrder: ['description', 'image', 'title'],
      }),
    ).toEqual(['description', 'title', 'date', 'contentType', 'tags', 'cta']);
  });
});

describe('getHiddenElements', () => {
  it('lists the elements that are switched off', () => {
    expect(
      getHiddenElements({
        hasMetaType: false,
        hasDate: false,
        hasBenchmarkLevel: false,
        hasDescription: true,
        hasTags: true,
        callToAction: { enable: false },
      }),
    ).toEqual(['contentType', 'date', 'benchmark', 'cta']);
  });
});

describe('splitFooter', () => {
  it('moves the trailing tags and call to action to the footer', () => {
    expect(splitFooter(['image', 'title', 'tags', 'cta'])).toEqual({
      body: ['image', 'title'],
      footer: ['tags', 'cta'],
    });
  });

  it('keeps tags and call to action placed between other elements', () => {
    expect(splitFooter(['tags', 'image', 'title', 'cta'])).toEqual({
      body: ['tags', 'image', 'title'],
      footer: ['cta'],
    });
  });
});
