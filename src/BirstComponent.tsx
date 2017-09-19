import * as React from 'react';
import { Component, ComponentClass, ComponentType } from 'react';
import { IBqlResults } from './birst/IBqlResults';
import { instance as bqlApi } from './birst/BqlApi';
import { IBqlQuery } from './birst/IBqlQuery';

// Diff / Omit taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
	{ [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export function connectToBirst<TMappedResultProps>(query: IBqlQuery<TMappedResultProps>) {
	function createBirstComponent<TCombinedProps extends TMappedResultProps>(
		WrappedComponent: ComponentType<TCombinedProps>
	): ComponentClass<Omit<TCombinedProps, keyof TMappedResultProps>> {
		interface IBirstComponentState {
			queryResults: TMappedResultProps | null;
			loading: boolean;
			error: any;
		}

		/**
		 * Component class that executes a BQL query, maps the result to a props object
		 * and then renders the inner component using those props.
		 */
		class BirstComponent extends Component<
			Omit<TCombinedProps, keyof TMappedResultProps>,
			IBirstComponentState
		> {
			constructor(props: Omit<TCombinedProps, keyof TMappedResultProps>, context?: any) {
				super(props);
				this.state = {
					loading: false,
					queryResults: null,
					error: null
				};
			}

			async componentDidMount() {
				this.setState({ loading: true, error: null });

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
					return <WrappedComponent {...this.state.queryResults} {...this.props} />;

				if (this.state.error) return <ErrorPlaceholder error={this.state.error} />;

				return <LoadingPlaceholder />;
			}
		}

		return BirstComponent;
	}

	return createBirstComponent;
}

export const LoadingPlaceholder = () => (
	<span
		style={{
			color: '#999',
			textAlign: 'center',
			width: '100%',
			margin: 20
		}}>
		Loading...
	</span>
);

export const ErrorPlaceholder = (props: { error: any }) => (
	<span
		style={{
			color: 'red',
			textAlign: 'center',
			width: '100%',
			margin: 10,
			padding: 10,
			background: '#fdeaea'
		}}>
		{`${props.error}`}
	</span>
);
