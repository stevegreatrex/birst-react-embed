export const delay = (timeout: number) =>
	new Promise(resolve => setTimeout(resolve, timeout));

export const waitForNextFrame = () => delay(1);

export default delay;
