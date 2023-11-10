import NewList from './NewsList';

describe('Test New List', () => {
  it('Given an object/object, p.restapi title/token', () => {
    expect(<NewList items={[]} />).toMatchSnapshot();
  });
});
