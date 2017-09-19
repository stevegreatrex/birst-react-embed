import * as React from 'react';
import { IBqlQuery } from './birst/IBqlQuery';
import { connectToBirst, LoadingPlaceholder } from './BirstComponent';
import { shallow, mount, render } from 'enzyme';

jest.mock('./birst/BqlApi');

describe('connectToBirst', () => {
	it('should initially render LoadingComponent', () => {
		const Component = () => <div>inner component</div>;
		const query: IBqlQuery<{}> = {
			bql: 'bql command',
			mapResultsToProps: results => ({})
		};
		const ConnectedComponent = connectToBirst(query)(Component);
		const wrapper = shallow(<ConnectedComponent />);
		expect(wrapper.contains(<LoadingPlaceholder />)).toBe(true);
	});
});
