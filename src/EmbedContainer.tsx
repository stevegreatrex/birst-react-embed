import * as React from 'react';
import { Props } from 'react';

export const EmbedContainer = (props: Props<{}>) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			alignContent: 'center',
			justifyContent: 'center',
			fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
			overflowX: 'hidden'
		}}>
		{props.children}
	</div>
);
