// An explicit selection wins over the former independent toggles.
export const getBorder = (styles = {}) =>
  styles['border:noprefix'] ??
  (styles['topAccent:bool']
    ? 'top-accent'
    : styles['bordered:bool']
      ? 'bordered'
      : 'no-border');

export const getBorderStyles = (styles = {}) => {
  const rest = { ...styles };
  delete rest['topAccent:bool'];
  delete rest['bordered:bool'];
  return { ...rest, 'border:noprefix': getBorder(styles) };
};
