import * as React from 'react';
import { shallow } from 'enzyme';
import { Marker } from './marker';

describe('Marker', () => {
  it('should render svg icon', () => {
    const tree = shallow((
      <Marker color="color" />
    ));

    expect(tree.find('svg'))
      .toHaveLength(1);
    expect(tree.find('svg').props().fill)
      .toEqual('color');
  });

  it('should pass the rest property to the root element', () => {
    const tree = shallow(<Marker customProperty />);
    const { customProperty } = tree.find('svg').props();
    expect(customProperty)
      .toBeTruthy();
  });
});
