# How to build a GraphQL diet planner app from scratch - Part I.

## The problem

Recently, I have been going to the gym several times a week and I was advised to try to follow a high protein diet. Since I have no knowledge about nutritions and I am a coder it sounds an opportunity to build a new app.

## Features

- As a user I would like to **search recipes** based on my preference (high protein, vegan, etc).
- As a user I would like to **create a diet** for a specific timespan.

## Services and technologies

- Database: [AWS DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- Accessing the data: [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html)
- [Recipe - Food - Nutrition API](https://rapidapi.com/spoonacular/api/recipe-food-nutrition)
- Unified solution for communicating with the different APIs: [WunderGraph](https://wundergraph.com/)
- Client: [Next.js](https://nextjs.org/)


## Prerequisites

- [AWS account](https://aws.amazon.com/)
- [RapidApi subscription](https://rapidapi.com/hub)

## Coding

### Getting started

There is a UI provided by RapidApi to test the endpoints. (You can grab your key from there.) After a little expermination I decided to use the **"Search Recipes"** endpoint and the **"Get Recipe Information"**. My point now is to have a minimum working solution. Feel free to use other endpoints with more options.

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

### A little frontend

At this point I would like to just list the search results. So I need a *Search* and a *List* component.