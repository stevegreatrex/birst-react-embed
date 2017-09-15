declare var process: any;

export const env = {
	isDebug: process.env.NODE_ENV !== 'production'
};