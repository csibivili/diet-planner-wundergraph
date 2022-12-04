import {
  authProviders,
  configureWunderGraphApplication,
  cors,
  introspect,
  templates,
  EnvironmentVariable,
} from '@wundergraph/sdk'
import { NextJsTemplate } from '@wundergraph/nextjs/dist/template'
import server from './wundergraph.server'
import operations from './wundergraph.operations'
import { IHeadersBuilder } from '@wundergraph/sdk/dist/definition/headers-builder'

const food = introspect.openApi({
  apiNamespace: 'food',
  source: {
    kind: 'file',
    filePath: './food-nutrition.yaml',
  },
  headers: (builder: IHeadersBuilder) =>
    builder
      .addStaticHeader('X-RapidAPI-Key', new EnvironmentVariable('RAPID_API_KEY'))
      .addStaticHeader('X-RapidAPI-Host', 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'),
})

const dietplanner = introspect.graphql({
  apiNamespace: 'dietplanner',
  url: new EnvironmentVariable('DIET_PLANNER_BE_URL'),
  headers: (builder: IHeadersBuilder) =>
    builder.addStaticHeader('x-api-key', new EnvironmentVariable('DIET_PLANNER_BE_KEY')),
})

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
  apis: [food, dietplanner],
  server,
  operations,
  codeGenerators: [
    {
      templates: [...templates.typescript.all, templates.typescript.operations, templates.typescript.linkBuilder],
    },
    {
      templates: [templates.typescript.client, new NextJsTemplate()],
      path: '../components/generated',
    },
  ],
  cors: {
    ...cors.allowAll,
    allowedOrigins: process.env.NODE_ENV === 'production' ? ['http://localhost:3000'] : ['http://localhost:3000'],
  },
  authentication: {
    cookieBased: {
      providers: [authProviders.demo()],
      authorizedRedirectUris: ['http://localhost:3000'],
    },
  },
  security: {
    enableGraphQLEndpoint: process.env.NODE_ENV !== 'production',
  },
})
