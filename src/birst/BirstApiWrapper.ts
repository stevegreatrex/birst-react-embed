import { IBqlResults } from './IBqlResults';
import { ManualPromise } from '../ManualPromise';

interface IBirstCallbackParameters {
	data: {
		operation: 'executeQueryResult' | 'setFilters' | string;
		result: IBqlResults;
	};
}

/**
 * This global will be available within the scope of the dashboard.  It has other
 * methods on it and this signature is probably all wrong (and certainly very partial)
 * but hey, if the good lord had wanted us to have a complete definition then he would
 * have convinced Birst to document it
 */
declare const BirstConfig: {
	getData: (query: string) => void;
	callBack: (eventHandler: (parameters: IBirstCallbackParameters) => void) => void;
};

/**
 * This will only support a single concurrent request but that's all we need for
 * the proof of concept.
 */
export class BirstApiWrapper {
	private static _instance: BirstApiWrapper;
	static get instance() {
		if (!('BirstConfig' in window))
			throw new Error(
				'BirstConfig is not present.  Have you included the <script src="/js/birst_embed.js"></script> tag?'
			);
		if (!BirstApiWrapper._instance) BirstApiWrapper._instance = new BirstApiWrapper();
		return BirstApiWrapper._instance;
	}
	constructor() {
		BirstConfig.callBack(event => this.onEventReceived(event));
	}

	private onEventReceived(event: IBirstCallbackParameters) {
		if (event.data.operation !== 'executeQueryResult') return;

		//todo: tidy this API up whilst 1. still returning promises; and 2. working with
		//the unusual design choices in Birst's JS API

		//ideas:
		// 1. see if there is any way to trick the BirstConfig object into passing through
		//    an ID or something
		// 2. if not, allow individual pending requests to either accept or reject the
		//    result.  Simple chain of responsibility, assuming that it's possible to
		//    identify whether or not a set of query results came from me

		this.pendingRequests.forEach(r => r.resolve(event.data.result as IBqlResults));
		this.pendingRequests = [];
	}

	private pendingRequests: ManualPromise<IBqlResults>[] = [];

	public beginGetData(query: string) {
		BirstConfig.getData(query);
	}

	public waitForNextResult(): PromiseLike<IBqlResults> {
		const request = new ManualPromise<IBqlResults>();
		this.pendingRequests.push(request);
		return request;
	}
}
