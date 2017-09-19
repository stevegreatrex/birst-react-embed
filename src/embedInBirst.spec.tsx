import * as React from 'react';
import { EmbedContainer } from './EmbedContainer';
import { attachElement } from './embedInBirst';
import * as ReactDom from 'react-dom';

describe('attachElement', () => {
	it('renders into target element', () => {
		const TestComponent = (props: {}) => <div id="content" />;
		const element = document.createElement('div');

		attachElement(() => <TestComponent />)(element);
		expect(element).toMatchSnapshot();
	});

	it('passes parsed props into component', () => {
		const TestComponent = (props: { id?: string }) => <div id={props.id} />;
		const element = document.createElement('div');
		element.setAttribute('data-birst-content', '{ "id": "test" }');

		attachElement(props => <TestComponent {...props} />)(element);
		expect(element.querySelector('div#test')).toBeTruthy();
		expect(element).toMatchSnapshot();
	});
});
