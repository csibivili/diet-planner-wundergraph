# How to build a GraphQL diet planner app from scratch - Part I.

## TLDR
- [frontend repo](https://github.com/csibivili/diet-planner-wundergraph)
- [backend repo](https://github.com/csibivili/diet-planner-backend)

## The problem

Recently, I have been going to the gym several times a week and I was advised to try to follow a high protein diet. Since I have no knowledge about nutritions and I am a coder this gives me an opportunity to build a new app.

## Features

- As a user I would like to **search recipes** based on my preference (high protein, vegan, etc)
- As a user I would like to **save some recipes** for later

## Services and technologies

- Database: [AWS DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- Accessing the data: [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html)
- Managing backend stack: [SST](https://sst.dev/)
- [Recipe - Food - Nutrition API](https://rapidapi.com/spoonacular/api/recipe-food-nutrition)
- Unified solution for communicating with the different APIs: [WunderGraph](https://wundergraph.com/)
- Client: [Next.js](https://nextjs.org/)


## Prerequisites

- [AWS account](https://aws.amazon.com/)
- [RapidApi subscription](https://rapidapi.com/hub)

## Coding

### Getting started

There is a UI provided by RapidApi to test the endpoints. (You can also grab your key from there.) After a little expermination I decided to use the **"Search Recipes"** endpoint and the **"Get Recipe Information"**. My point now is to have a minimum working solution. Feel free to use other endpoints with more options.

To consume the RapidApi I will use **WunderGraph**.
- It provides a **type safe** way to interact with the api
- and a **unified platform** where I will be able to wire other services as well (will be back to this point later).

### Setup WunderGraph

1. Next.js template is perfect to start our project: `npx create-wundergraph-app diet-planner -E nextjs`

 2. Replace template code with ours

In the template code there is an introspection for SpaceX GraphQL. The RapidApi is built on REST so we need to configure it differently.

Replace the `spaceX` configuration with the below in the *wundergraph.config.ts* file.

```typescript
const food = introspect.openApi({
	apiNamespace: 'food',
	source: {
		kind: 'file',
		filePath: './food-nutrition.yaml'
	},
	headers: builder => 
		builder
			.addStaticHeader('X-RapidAPI-Key', new EnvironmentVariable('RAPID_API_KEY'))
			.addStaticHeader('X-RapidAPI-Host', 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'),
})
```

3. Update the `configureWunderGraphApplication` function's `api` property.

4. As you might noticed there is an environment variable in the header section of the config so create a *.env* file and add your `RAPID_API_KEY`. The configured header will be added to each call.

5. Specify the **search endpoint** with Open Api standards. At this point we are aiming for the minimum.

```yaml
openapi: 3.0.0
info:
  title: food
  version: '1.0'
servers:
  - url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
paths:
  '/recipes/complexSearch':
    parameters:
      - schema:
          type: string
        name: query
        in: query
        required: true
    get:
      summary: Your GET endpoint
      tags: []
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Recipe'
      operationId: searchRecipes
components:
  schemas:
    Recipe:
      title: Recipe
      type: object
      properties:
        id:
          type: number
        title:
          type: string
```

So far only one request parameter is mapped and the result object is neither complete. Only `id` and `title` are returned.

As a last step a graphql operation must be added. Don't forget to pass the parameter!


```graphql
query Recipes($query: String!) {
	food_searchRecipes(query: $query) {
		results {
			id
			title
		}
	}
}
```

The referenced query's name is concatenated from two parts: 
- *food* comes from the base configuration (how we named the api)
- *searchRecipes* comes from the yaml file's *operationId* property.

> The query can be tested on this url: http://localhost:9991/operations/Recipes?query=pasta

### A little frontend

![index page](https://d2mzaibvtxa92j.cloudfront.net/Screenshot+2022-12-04+at+AM+10.36.50.png)

At this point I would like to just list the search results. I have reused what I could from the original template. Again, create something nicer if you'd like. An important change I have made is in the `useQuery` hook. There is a `query` state variable which passed to the query:

```typescript
const [query, setQuery] = useState('')
const recipes = useQuery({
  operationName: 'Recipes',
  input: {
    query,
  }
})
```

> Thanks to the WunderGraph setup now we have autocomplete on the paramater. With one parameter it is not much but imagine it with 10+ items.

### Get recipe's information

Since the search endpoint provides just few informations about a recipe somehow the details should be retrieved. There is a get by id endpoint for this purpose. It is worth to test again the endpoint on the UI first.

Based on the other endpoint the new endpoint configuration should look like this:

```yaml
'/recipes/{id}/information':
  parameters:
    - schema:
        type: string
      name: id
      in: path
      required: true
  get:
    summary: get info endpoint
    tags: []
    responses:
      '200':
        description: OK
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Recipe'
    operationId: getRecipe
```

A property was added to the Recipe component as well:

```yaml
instructions:
  type: string
```

And the associated query:

```graphql
query Recipe($id: String!) {
  food_getRecipe(id: $id) {
    id
    title
    instructions
  }
}
```

> The query can be tested on this url: http://localhost:9991/operations/Recipe?id=603414

### Recipe's details page

![details page](https://d2mzaibvtxa92j.cloudfront.net/Screenshot%202022-12-04%20at%20AM%2010.37.26.png)

1. Add linking to the **index.tsx**. Each listed element should navigate to the */{id}* route
2. Create details page: **[id].tsx**
3. Copy everything that we can from the index page
4. Show the title and the istructions for the current recipe

### Save and retrieve the recipes we like

A simple GraphQL API can be created in minutes with the help of [SST](https://sst.dev). The goal is to be able to save recipes and later retrieve them.

1. Start with a template:
```
npx create-sst@latest --template=minimal/typescript-starter diet-planner-backend
```
2. Followed [this guide](https://sst.dev/chapters/create-a-dynamodb-table-in-sst.html) to create a table for recipes

My storage stack based on the guide:
```typescript
import { StackContext, Table } from '@serverless-stack/resources'

export function StorageStack({ stack }: StackContext) {
  // Create the DynamoDB table
  const table = new Table(stack, 'Recipes', {
    fields: {
      recipeId: 'string',
    },
    primaryIndex: { partitionKey: 'recipeId' },
  })

  return {
    table,
  }
}
```

3. Used [this guide](https://sst.dev/examples/how-to-create-a-serverless-graphql-api-with-aws-appsync.html) for api creation

- My project structure a bit different:
![project structure](https://d2mzaibvtxa92j.cloudfront.net/Screenshot+2022-12-04+at+PM+12.16.18.png)
- And I renamed **lambda.ts** to **main.ts**
- Also I have faced an issue as the top level schema is required for AWS so schema file should start with:
```graphql
schema {
  query:Query
  mutation: Mutation
}
```

My Api stack:
```typescript
import { AppSyncApi, StackContext, use } from '@serverless-stack/resources'
import { StorageStack } from './StorageStack'

export function ApiStack({ stack }: StackContext) {
  const { table } = use(StorageStack)

  // Create the API
  const api = new AppSyncApi(stack, 'Api', {
    schema: 'services/graphql/schema.graphql',
    defaults: {
      function: {
        bind: [table],
      },
    },
    dataSources: {
      recipes: 'functions/main.handler',
    },
    resolvers: {
      'Query getRecipes': 'recipes',
      'Mutation saveRecipe': 'recipes',
    },
  })

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiId: api.apiId,
    APiUrl: api.url,
  })

  // Return the API resource
  return {
    api,
  }
}
```

Schema:
```graphql
schema {
  query:Query
  mutation: Mutation
}

type Recipe {
  recipeId: ID!
  instructions: String!
}

input RecipeInput {
  recipeId: ID!
  instructions: String!
}

type Query {
  getRecipes: [Recipe]
}

type Mutation {
  saveRecipe(recipe: RecipeInput!): Recipe
}
```

getRecipes
```typescript
import { DynamoDB } from 'aws-sdk'
import { Table } from '@serverless-stack/node/table'

const dynamoDb = new DynamoDB.DocumentClient()

export default async function getRecipes(): Promise<Record<string, unknown>[] | undefined> {
  const params = {
    TableName: Table.Recipes.tableName,
  }

  const data = await dynamoDb.scan(params).promise()

  return data.Items
}
```

saveRecipe
```typescript
import { DynamoDB } from 'aws-sdk'
import { Table } from '@serverless-stack/node/table'
import Recipe from '../Recipe'

const dynamoDb = new DynamoDB.DocumentClient()

export default async function createNote(recipe: Recipe): Promise<Recipe> {
  const params = {
    Item: recipe as Record<string, unknown>,
    TableName: Table.Recipes.tableName,
  }

  await dynamoDb.put(params).promise()

  return recipe
}
```

main.ts
```typescript
import Recipe from '../Recipe'
import saveRecipe from './saveRecipe'
import getRecipes from './getRecipes'

type AppSyncEvent = {
  info: {
    fieldName: string
  }
  arguments: {
    recipe: Recipe
  }
}

export async function handler(
  event: AppSyncEvent
): Promise<Record<string, unknown>[] | Recipe | string | null | undefined> {
  switch (event.info.fieldName) {
    case 'saveRecipe':
      return await saveRecipe(event.arguments.recipe)
    case 'getRecipes':
      return await getRecipes()
    default:
      return null
  }
}
```

And finally my **index.tsx** in *stacks* folder:
```typescript
import { App } from '@serverless-stack/resources'
import { StorageStack } from './StorageStack'
import { ApiStack } from './ApiStack'
import { RemovalPolicy } from 'aws-cdk-lib'

export default function main(app: App) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    srcPath: 'services',
    bundle: {
      format: 'esm',
    },
  })

  app.stack(StorageStack).stack(ApiStack).setDefaultRemovalPolicy(RemovalPolicy.DESTROY)
}
```

> RemovalPolicy.DESTROY should be used in only development

Our stack can be tested in SST Console:
1. `yarn start`
2. Open SST Console (link is in the terminal where `yarn start` was used)
3. Create item
![create items](https://d2mzaibvtxa92j.cloudfront.net/Screenshot+2022-12-04+at+PM+12.35.16.png)
4. Retrieve items
![retrieve items](https://d2mzaibvtxa92j.cloudfront.net/Screenshot+2022-12-04+at+PM+12.35.54.png)