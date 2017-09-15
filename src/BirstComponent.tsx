import * as React from 'react';
import {Component, ComponentState, ComponentType} from 'react';
import {IBqlResults} from './birst/IBqlResults';
import {instance as bqlApi} from './birst/BqlApi';
import {IBqlQuery} from './birst/IBqlQuery';

export function connectToBirst<TInnerProps>(query: IBqlQuery<TInnerProps>) {
	//todo: remove <any>
	function createBirstComponent(
		WrappedComponent: ComponentType<TInnerProps>
	): any {
		interface IBirstComponentState {
			queryResults: TInnerProps | null;
			loading: boolean;
			error: any;
		}

		/**
		 * Component class that executes a BQL query, maps the result to a props object
		 * and then renders the inner component using those props.
		 */
		class BirstComponent extends Component<{}, IBirstComponentState> {
			constructor(props?: {}, context?: any) {
				super(props);
				this.state = {
					loading: false,
					queryResults: null,
					error: null
				};
			}

			async componentDidMount() {
				this.setState({loading: true, error: null});

				try {
					const queryResults = await bqlApi.executeQuery(query);

					this.setState({
						loading: false,
						queryResults
					});
				} catch (error) {
					console.error(`BQL Query Error: ${error}`);
					this.setState({
						loading: false,
						error
					});
				}
			}

			render() {
				if (this.state.queryResults)
					return <WrappedComponent {...this.state.queryResults} />;

				if (this.state.error)
					return <ErrorPlaceholder error={this.state.error} />;

				return <LoadingPlaceholder />;
			}
		}

		return BirstComponent;
	}

	return createBirstComponent;
}

const LoadingPlaceholder = () => (
	<span
		style={{
			color: '#999',
			textAlign: 'center',
			width: '100%',
			margin: 20
		}}
	>
		Loading...
	</span>
);

const ErrorPlaceholder = (props: {error: any}) => (
	<span
		style={{
			color: 'red',
			textAlign: 'center',
			width: '100%',
			margin: 10,
			padding: 10,
			background: '#fdeaea'
		}}
	>
		{`${props.error}`}
	</span>
);
