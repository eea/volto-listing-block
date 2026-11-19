import { getBorder, getBorderStyles } from './border';

describe('card border compatibility', () => {
  it.each([
    [{}, 'no-border'],
    [{ 'bordered:bool': true }, 'bordered'],
    [{ 'topAccent:bool': true }, 'top-accent'],
    [{ 'topAccent:bool': true, 'bordered:bool': true }, 'top-accent'],
    [{ 'topAccent:bool': false, 'bordered:bool': false }, 'no-border'],
  ])('resolves existing settings %j to %s', (styles, expected) => {
    expect(getBorder(styles)).toBe(expected);
  });

  it.each(['no-border', 'bordered', 'top-accent'])(
    'lets the selected %s replace both legacy toggles without mutating data',
    (border) => {
      const styles = Object.freeze({
        'border:noprefix': border,
        'topAccent:bool': true,
        'bordered:bool': true,
        'theme:noprefix': 'primary',
      });
      expect(getBorderStyles(styles)).toEqual({
        'border:noprefix': border,
        'theme:noprefix': 'primary',
      });
    },
  );
});
