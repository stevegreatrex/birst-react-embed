import * as React from 'react';
import { IBqlQuery } from './birst/IBqlQuery';
import { IBqlResults } from './birst/IBqlResults';
import { connectToBirst, LoadingPlaceholder, ErrorPlaceholder } from './BirstComponent';
import { instance as bqlApi } from './birst/BqlApi';
import { shallow, mount, render } from 'enzyme';
import { ManualPromise } from './ManualPromise';
import { waitForNextFrame } from './delay';

const executeQuery = jest.spyOn(bqlApi, 'executeQuery');

describe('connectToBirst', () => {
	type PropsFromQuery = {
		fromQuery?: string;
	};

	type CombinedProps = PropsFromQuery & {
		fromProps?: string;
	};

	const Component = (props: CombinedProps) => (
		<div>
			<span>{props.fromQuery}</span>
			<span>{props.fromProps}</span>
		</div>
	);
	const query: IBqlQuery<PropsFromQuery> = {
		bql: 'bql command',
		mapResultsToProps: results => ({ fromQuery: 'not used due to mocking' })
	};

	const ConnectedComponent = connectToBirst(query)(Component);

	it('should initially render LoadingComponent', () => {
		const wrapper = shallow(<ConnectedComponent />);

		expect(wrapper.find(LoadingPlaceholder).exists()).toBe(true);
		expect(wrapper.find(Component).exists()).toBe(false);
	});

	it('should render inner component after load', async done => {
		const apiResponse = new ManualPromise<PropsFromQuery>();
		executeQuery.mockReturnValue(apiResponse);

		const wrapper = mount(<ConnectedComponent />);

		expect(executeQuery).toBeCalledWith(query);
		expect(wrapper.find(LoadingPlaceholder).exists()).toBe(true);
		expect(wrapper.find(Component).exists()).toBe(false);

		apiResponse.resolve({ fromQuery: 'results' });
		await waitForNextFrame();

		expect(wrapper.find(LoadingPlaceholder).exists()).toBe(false);
		expect(wrapper.find(Component).exists()).toBe(true);
		done();
	});

	it('should start combine props from query & parent props', async done => {
		const apiResponse = Promise.resolve({ fromQuery: 'results' });
		executeQuery.mockReturnValue(apiResponse);

		const wrapper = mount(<ConnectedComponent fromProps="props" />);
		await waitForNextFrame();

		expect(wrapper.find(Component).props().fromQuery).toEqual('results');
		expect(wrapper.find(Component).props().fromProps).toEqual('props');
		done();
	});

	it('should render error details', async done => {
		const apiResponse = new ManualPromise<PropsFromQuery>();
		executeQuery.mockReturnValue(apiResponse);

		const wrapper = mount(<ConnectedComponent />);

		apiResponse.reject('oh no!');
		await waitForNextFrame();

		expect(wrapper.find(LoadingPlaceholder).exists()).toBe(false);
		expect(wrapper.find(ErrorPlaceholder).exists()).toBe(true);
		expect(wrapper.find(ErrorPlaceholder).props().error).toEqual('oh no!');
		done();
	});
});
