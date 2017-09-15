import {env} from '../env';
import {IBqlResults} from './IBqlResults';
import {BirstApiWrapper} from './BirstApiWrapper';

export interface IBqlApi {
	executeQuery(query: string): Promise<IBqlResults>;
}

class BqlApi implements IBqlApi {
	async executeQuery(query: string): Promise<IBqlResults> {
		return await BirstApiWrapper.instance.waitForNextResult();
	}
}

class MockBqlApi implements IBqlApi {
	async executeQuery(query: string): Promise<IBqlResults> {
		const response = await fetch('/sample-query-response.json');
		return await response.json();
	}
}

export const instance: IBqlApi = env.isDebug ? new MockBqlApi() : new BqlApi();
