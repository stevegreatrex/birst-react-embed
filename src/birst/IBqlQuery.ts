import {IBqlResults} from './IBqlResults';

export interface IBqlQuery<TProps> {
	bql: string;
	mapResultsToProps(results: IBqlResults): TProps;
}
