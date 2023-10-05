import React from 'react';
import renderer from 'react-test-renderer';
import {
  DefaultCardLayout,
  LeftImageCardLayout,
  RightImageCardLayout,
  ImageCardLayout,
} from './CardTemplates';

jest.mock('@plone/volto/components', () => ({
  ConditionalLink: () => <div>ConditionalLink</div>,
  UniversalLink: () => <div>UniversalLink:</div>,
}));

describe('DefaultCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'DefaultCardLayout title',
      description: 'DefaultCardLayout description',
      meta: 'DefaultCardLayout meta',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const component = renderer.create(
      <DefaultCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});

describe('LeftImageCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'LeftImageCardLayout title',
      description: 'LeftImageCardLayout description',
      meta: 'LeftImageCardLayout meta',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const component = renderer.create(
      <LeftImageCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});

describe('RightImageCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'RightImageCardLayout title',
      description: 'RightImageCardLayout description',
      meta: 'RightImageCardLayout meta',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const component = renderer.create(
      <RightImageCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});

describe('ImageCardLayout', () => {
  it('renders correctly', () => {
    const item = {
      title: 'ImageCardLayout title',
      description: 'ImageCardLayout description',
      meta: 'ImageCardLayout meta',
    };

    const itemModel = {
      hasImage: true,
      hasDate: true,
      hasDescription: true,
      imageOnRightSide: false,
    };

    const component = renderer.create(
      <ImageCardLayout
        item={item}
        itemModel={itemModel}
        className="my-class"
        imagePosition="left"
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
