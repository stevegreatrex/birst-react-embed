import * as React from 'react';
import {Props} from 'react';

export interface IEmbedProps {}

export const Embed = (props: Props<IEmbedProps>) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			alignContent: 'center',
			justifyContent: 'center',
			fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
		}}
	>
		{props.children}
	</div>
);
