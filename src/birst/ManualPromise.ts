export class ManualPromise<T> implements PromiseLike<T> {
	reject: (reason?: any) => void;
	resolve: (value?: T | PromiseLike<T> | undefined) => void;
	private concretePromise: Promise<T>;
	
	then<TResult1 = T, TResult2 = never>(
		onfulfilled?:
			| ((value: T) => TResult1 | PromiseLike<TResult1>)
			| null
			| undefined,
		onrejected?:
			| ((reason: any) => TResult2 | PromiseLike<TResult2>)
			| null
			| undefined
	): PromiseLike<TResult1 | TResult2> {
		return this.concretePromise.then(onfulfilled, onrejected);
	}

	constructor() {
		this.concretePromise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}
