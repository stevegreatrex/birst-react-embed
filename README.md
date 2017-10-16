# React in Birst
Embed React-generated content in a Birst dashboard and pass BQL query results to your components as props.

## Why does this library exist
Birst dashboards allow you to embed rich HTML & JS content but the mechanism doesn't allow much in the way of engineering practices and the developer story is pretty painful.  

* 😭 All code must be entered into an unformatted text box
* 😭 Any shared code must be copy/pasted between spaces
* 😭 No way to source control the results (besides copy/pasting in & out of another editor)

This library is a proof of concept for hosting the custom content externally, allowing the developer to manage deployment, hosting & engineering practices properly whilst still working within Birst.

## Why React?
Birst dashboards already pull in both Angular & jQuery as dependencies so "why add React?" is a valid question.  There's no slam dunk reason to go with React (and some alternatives are suggested below) but here is some of the thought process behind the decision.

* 💡 Combines all resources into a single package to minimise additional network requests
* 💡 `connectToBirst` & higher-order components abstract complexity of BQL queries nicely
* 💡 Hot-module reloading significantly improves developer experience
* 💡 Pretty basic hosting requirements for generated resources (i.e. static file hosting)
* 💡 Type safety for Birst results & component development
* 🤔 One more library, and not a tiny one either.  @ ~ 150KB React is definitely extra weight
* 🤔 At least one more network request
* 🤔 One more technology to learn (depending on background)

## Mitigation
The issue of increased network requests & JS size is the most significant here, though it's worth stating that Birst dashboards are already fairly bloated (~4MB JS & ~70 requests for a single-widget dashboard) so the net effect is likely minimal.

You can definitely mitigate the effect as you would for any other webpack-built project:

1. Generate webpack assets with a `[chunkhash]` when deploying to production
2. Set far-future cache expiry on all hosted assets.  Using `[chunkhash]` means you don't need to worry about cache invalidation.

Note that this has some impact on deploying new versions so you may want to reconsider/modify this approach depending on your deployment strategy.

## Alternatives
The concepts used here are in no way tied to React.  The same concepts (pulling content from an external source; abstracting complexity of Birst BQL API) could be implemented in Vanilla JS, static HTML, or any of the myriad JavaScript libraries available.

In theory you could significantly reduce library size by compiling this project using `preact-compat`, though this hasn't been tested!

## Installation

```
npm install --save birst-react-embed
```

## Basic Use

```typescript
import * as React from 'react';
import {embedInBirst} from 'birst-react-embed';

const HelloWorld = () => <h1>Hello, Birst</h1>;

embedInBirst(() => <HelloWorld />);
```
## Local Development and Debugging
Working on a project within a Birst dashboard itself is a pretty horrendous experience.  I recommend using `webpack-dev-server` with hot reloading for the majority of development and then give it a final test in Birst before shipping!  You can even combine `webpack-dev-server` with `ngrok` to host your local dev content in a Birst dashboard directly.

To test and develop locally just start up `webpack-dev-server` (`Ctrl+Shift+B` if you're using VSCode). This will serve the content to the specified port on local host. By default this is `http://localhost:3000/index.html`.

Navigate to the `index.html` page for the selected component (example: `localhost:3000/src/my-component/my-component.html`). Webpack will automatically rebuild any changes made to the TSX or HTML for that component.

> Note: If you are running locally _without_ ngrok (i.e. not embedded within Birst) then you don't have access to the Birst API. To improve the dev experience, whenever `process.env.NODE_ENV !== 'production'` this library will replace the _real_ BQL API with a mock one that will use `fetch` to resolve the `sampleResponseUrl` for your defined query. It will error with `Unexpected Token at position x` if you try and host locally without a valid `sample.json`.

## Hosting with Ngrok
To test in Birst you'll need to host the generated code somewhere. Let's assume you have used something like `webpack` to generate a single bundle using dev-server, you can use [ngrok](https://ngrok.com/) to quickly forward the local port that dev-server is running on.

An example ngrok command: `ngrok http -host-header=rewrite 3000` (Host-header rewrite is required).

This will give you a random publicly facing url that is serving your content. If you are using `webpack-dev-server` with `ngrok`, you can make changes and it will rebuild and update the content on ngrok without you having to do anything else 🎉!

Now you have your content being served publicly, but to actually test with birst data you need to embed it in a valid Birst dashboard. See: `Embedding in Birst` 

## Hosting with Netlify
If you wish to test a production build or use a hosting solution with custom DNS and auto-deploy, then one option would be to use [netlify](https://www.netlify.com/). Simply setup an account with netlify and add a new site pointing to your github repo and the specific branch. Assuming you have `webpack -p` configured as the `build` script in `package.json` in netlify simply set the launch command to `npm run build`. Once this is setup it should serve the content at a random url `netlify-url-1000.netlify.com` and you can use this to embed in a dashboard.

## Embedding in Birst
> Note: This section assumes you have a publicly hosted js file and that any birst data you are referencing in your React components already exist in the current dashboard.

The BQL and theme Parameters are now passed in with the HTML widget, using the following structure:

```javascript
interface IRequiredExternalParameters {
    query: {
        bql: string;
        columns: string[];
    };
    drillDown?: IProfileGridParameters['drillDown'];
    theme?: ITheme;
}
```

In your Birst dashboard, add an HTML widget and insert the following snippet:

```html
<script src="/js/birst_embed.js">
	<script>
		// Set parameters for widget.  Could be included in HTML attribute
		document.querySelector('[data-birst-content]').setAttribute('data-birst-content', JSON.stringify({
			query: {
				bql: 'SELECT TOP 100 USING OUTER JOIN [Sport Profile.Player Id] \'COL0\', [Sport Profile.Full Name] \'COL1\' FROM [ALL] WHERE ( ( [Group.Group Name]=\'2017-2018 Roster\' ) ) ',
				columns: ['id', 'fullName']
			},
			theme: {
				primaryColor: '#008348',
				logoUrl: 'http:yourlogo.com/logo.png',
				fallbackPlayerImageUrl: 'http://cdn.bleacherreport.net/images/team_logos/328x328/nba.png',
			}
		}));
	</script>
</script>
```

That's it! 🎉

> Note: the `Loading...` span will be replaced once the JS package has been downloaded and has started loading

## Component Parameters
Ideally we'd like to reuse any components we create and the likelihood is that they'll need at least _some_ parameters.

These can be serialized into the value of the `data-birst-content` attribute and will be passed to the factory function within `embedInBirst`.

```html
<div data-birst-content='{ "message": "hello, world" }'>
</div>
```

```typescript
embedInBirst(parameters => {
  // parameters == { message: 'hello, world' }
  return <h1>{parameters.message}</h1>;
})
```

## BQL Integration
Custom HTML content on it's own is not that useful; normally you'll want some content sourced from Birst itself.

To get content, you need to define and execute a query in BQL.  This can be a pretty complicated process and is worthy of it's own documentation.  Birst themselves have plenty of docs covering this so I'm going to assume that part is covered.

This library includes a basic wrapper around the (_very_ basic) Birst JS API that allows you to run a BQL query.

> ⚠️This has had very little testing!  ~If~ when you find a bug, submit a PR! ⚠️

You can connect a component to the results of a BQL query using the `connectToBirst` higher order component:

```typescript
import * as React from 'react';
import {connectToBirst, IBqlQuery} from 'birst-react-embed';

interface MyComponentProps {
  message: string;
}

const MyComponent = (props: MyComponentProps) => <h1>Hello, { message }</h1>;

const myQueryDefinition: IBqlQuery<MyComponentProps> = {
	//...
};

export default connectToBirst(myQueryDefinition)(MyComponent);
```

The query definition itself has 3 components:

1. The BQL string to execute
2. A function to map the `IBqlResults` results into appropriate props for your component
3. A URL that contains a sample JSON response for the query (see Debug Mode below)

This creates a component that, once mounted, will load the results of the BQL query, transform them into some useful (and strongly typed) props and then render your component.

```typescript
export const definition: IBqlQuery<IClientsTableProps> = {
  bql: 'SELECT USING OUTER JOIN...',
  sampleResultsUrl: '/sample-query-response.json',
  mapResultsToProps: (results: IBqlResults) => ...
};
```