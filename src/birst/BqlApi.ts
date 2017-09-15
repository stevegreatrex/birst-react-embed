import {env} from '../env';
import {IBqlResults} from './IBqlResults';
import {IBqlQuery} from './IBqlQuery';
import {BirstApiWrapper} from './BirstApiWrapper';

export interface IBqlApi {
	executeQuery<TProps>(query: IBqlQuery<TProps>): Promise<TProps>;
}

class BqlApi implements IBqlApi {
	async executeQuery<TProps>(query: IBqlQuery<TProps>): Promise<TProps> {
		BirstApiWrapper.instance.beginGetData(query.bql);
		const results = await BirstApiWrapper.instance.waitForNextResult();
		return query.mapResultsToProps(results);
	}
}

class MockBqlApi implements IBqlApi {
	async executeQuery<TProps>(query: IBqlQuery<TProps>): Promise<TProps> {
		const response = await fetch(query.sampleResultsUrl);
		const results = await response.json();
		return query.mapResultsToProps(results);
	}
}

export const instance: IBqlApi = env.isDebug ? new MockBqlApi() : new BqlApi();
