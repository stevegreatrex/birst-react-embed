import * as React from 'react';
import { ReactChildren } from 'react';
import { render } from 'react-dom';
import { EmbedContainer } from './EmbedContainer';

const attributeName = 'data-birst-content';

export function attachElement<TParams>(
	createEmbeddedElement: (params: TParams) => JSX.Element
) {
	return (element: HTMLElement) => {
		const serializedParameters = element.getAttribute(attributeName);
		const parameters: TParams = serializedParameters
			? JSON.parse(serializedParameters)
			: {};

		render(
			<EmbedContainer>{createEmbeddedElement(parameters)}</EmbedContainer>,
			element
		);
	};
}

export function embedInBirst<TParams>(
	createEmbeddedElement: (params: TParams) => JSX.Element
) {
	Array.from(document.querySelectorAll(`[${attributeName}]`)).forEach(
		attachElement(createEmbeddedElement)
	);
}
