import * as React from 'react';
import {ReactChildren} from 'react';
import {render} from 'react-dom';
import {Embed} from './Embed';
import {IEmbedProps} from './Embed';

const attributeName = 'data-birst-content';

export type EmbeddedElementFactory = (parameters: any) => JSX.Element;

const attachElement = (createEmbeddedElement: EmbeddedElementFactory) => (
	element: HTMLElement
) => {
	const parameters: IEmbedProps = JSON.parse(
		element.getAttribute(attributeName) || '{}'
	);
	element.style.overflowX = 'hidden';
	render(
		<Embed {...parameters}>{createEmbeddedElement(parameters)}</Embed>,
		element
	);
};

export function embedInBirst(createEmbeddedElement: EmbeddedElementFactory) {
	Array.from(document.querySelectorAll(`[${attributeName}]`)).forEach(
		attachElement(createEmbeddedElement)
	);
}
