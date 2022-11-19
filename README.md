# How to build a GraphQL diet planner app from scratch - Part I.

## The problem

Recently, I have been going to the gym several times a week and I was advised to try to follow a high protein diet. Since I have no knowledge about nutritions and I am a coder it sounds a new app to me.

## Features

- As a user I would like to search recipes based on my preference (high protein, vegan, etc).
- As a user I would like to create a diet for a specific timespan.

## Services and technologies

- Database: [AWS DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- Accessing the data: [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html)
- [Recipe - Food - Nutrition API](https://rapidapi.com/spoonacular/api/recipe-food-nutrition)
- Unified solution for communicating with the different APIs: [WunderGraph](https://wundergraph.com/)
- Client: Next.js


## Prerequisites

- AWS account
- RapidApi subscription

## Coding

### Getting started

There is a UI provided by RapidApi to test the endpoints. After a little expermination I decided to use the "Search Recipes" endpoint and the "Get Recipe Information" together. My point now is to have a minimum working solution. Feel free to use other endpoints with more options.

To consume the Food API I will use WunderGraph. First of all I will have a type safe way to interact with it and and secondly with WunderGraph I will have a unified platform to communicate with all API services.

### Setup WunderGraph

Next.js template is perfect to start our project:

`npx create-wundergraph-app diet-planner -E nextjs`




// get a recipe
// save the recipe for a day
// get seven recipes
// save for a week