import { getMaxLinesClasses } from './utils';

describe('getMaxLinesClasses', () => {
  it('limits the title and the description', () => {
    expect(getMaxLinesClasses({ maxTitle: 2, maxDescription: 3 })).toEqual({
      'title-max-2-lines': true,
      'max-3-lines': true,
    });
  });

  it('removes the limit with 0', () => {
    expect(getMaxLinesClasses({ maxTitle: 0, maxDescription: 0 })).toEqual({
      'title-max-0-lines': true,
      'max-0-lines': true,
    });
  });

  it('keeps the default limit when nothing is set', () => {
    expect(getMaxLinesClasses({})).toEqual({});
  });
});
