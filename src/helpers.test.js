import { getFieldURL } from './helpers';
import { flattenToAppURL } from '@plone/volto/helpers';

it('test getFieldUrl', () => {
  expect(getFieldURL({ value: 'some-link', '@type': 'URL' })).toEqual(
    'some-link',
  );
  expect(getFieldURL({ url: 'some-link', '@type': 'URL' })).toEqual(
    'some-link',
  );
  expect(getFieldURL({ href: 'some-link', '@type': 'URL' })).toEqual(
    'some-link',
  );

  expect(getFieldURL([{ url: 'some-link' }])).toEqual('some-link');
  expect(getFieldURL('/image')).toEqual(flattenToAppURL('/image'));
});
