# React in Birst
Embed React-generated content in a Birst dashboard and pass BQL query results to your components as props.

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

## Plugging into Birst
To embed the content in a Birst dashboard you'll need to host the generated code somewhere.  Let's assume you have used something like `webpack` to generate a single bundle hosted at `https://my-server.com/birst/content.js`.

In your Birst dashboard, add an HTML widget and insert the following snippet:

```html
<div data-birst-content></div>
<script src="https://my-server.com/birst/content.js"></script>
```

That's it! 🎉

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

## Debug Mode
Working on a project within a birst dashboard itself is a pretty horrendous experience.  I recommend using `webpack-dev-server` with hot reloading for the majority of development and then give it a final test in Birst before shipping!

Obviously you don't have access to the Birst API when working outside a Birst dashboard so whenever `process.env.NODE_ENV !== 'production'` this library will replace the _real_ BQL API with a mock one that will use `fetch` to resolve the `sampleResponseUrl` for your defined query.
