import {
	Client,
	ClientConfig,
	User,
	UploadRequestOptions,
	OperationMetadata,
	OperationsDefinition,
	OperationRequestOptions,
	SubscriptionRequestOptions,
	SubscriptionEventHandler,
	FetchUserRequestOptions,
} from "@wundergraph/sdk/client";
import type {
	RecipeResponse,
	RecipeInput,
	RecipeResponseData,
	RecipesResponse,
	RecipesInput,
	RecipesResponseData,
} from "./models";

export type UserRole = "admin" | "user";

export const WUNDERGRAPH_S3_ENABLED = false;
export const WUNDERGRAPH_AUTH_ENABLED = true;

export type UploadConfig = UploadRequestOptions<never>;

export enum AuthProviderId {
	"github" = "github",
}

export interface AuthProvider {
	id: AuthProviderId;
	login: (redirectURI?: string) => void;
}

export const defaultClientConfig: ClientConfig = {
	applicationHash: "dcf2df9c",
	baseURL: "http://localhost:9991",
	sdkVersion: "0.123.0",
};

export const operationMetadata: OperationMetadata = {
	Recipe: {
		requiresAuthentication: false,
	},
	Recipes: {
		requiresAuthentication: false,
	},
};

type PrivateConfigProperties = "applicationHash" | "sdkVersion" | "operationMetadata";

export class WunderGraphClient extends Client {
	query<
		OperationName extends Extract<keyof Operations["queries"], string>,
		Input extends Operations["queries"][OperationName]["input"] = Operations["queries"][OperationName]["input"],
		Data extends Operations["queries"][OperationName]["data"] = Operations["queries"][OperationName]["data"]
	>(options: OperationName extends string ? OperationRequestOptions<OperationName, Input> : OperationRequestOptions) {
		return super.query<OperationRequestOptions, Data>(options);
	}
	mutate<
		OperationName extends Extract<keyof Operations["mutations"], string>,
		Input extends Operations["mutations"][OperationName]["input"] = Operations["mutations"][OperationName]["input"],
		Data extends Operations["mutations"][OperationName]["data"] = Operations["mutations"][OperationName]["data"]
	>(options: OperationName extends string ? OperationRequestOptions<OperationName, Input> : OperationRequestOptions) {
		return super.mutate<OperationRequestOptions, Data>(options);
	}
	subscribe<
		OperationName extends Extract<keyof Operations["subscriptions"], string>,
		Input extends Operations["subscriptions"][OperationName]["input"] = Operations["subscriptions"][OperationName]["input"],
		Data extends Operations["subscriptions"][OperationName]["data"] = Operations["subscriptions"][OperationName]["data"]
	>(
		options: OperationName extends string
			? SubscriptionRequestOptions<OperationName, Input>
			: SubscriptionRequestOptions,
		cb: SubscriptionEventHandler<Data>
	) {
		return super.subscribe(options, cb);
	}
	public async uploadFiles(config: UploadConfig) {
		return super.uploadFiles(config);
	}
	public login(authProviderID: Operations["authProvider"], redirectURI?: string) {
		return super.login(authProviderID, redirectURI);
	}
	public async fetchUser<TUser extends User = User<UserRole>>(options: FetchUserRequestOptions) {
		return super.fetchUser<TUser>(options);
	}
}

export const createClient = (config?: Partial<Omit<ClientConfig, PrivateConfigProperties>>) => {
	return new WunderGraphClient({
		...defaultClientConfig,
		...config,
		operationMetadata,
	});
};

export type Queries = {
	Recipe: {
		input: RecipeInput;
		data: RecipeResponseData;
		requiresAuthentication: false;
		liveQuery: boolean;
	};
	Recipes: {
		input: RecipesInput;
		data: RecipesResponseData;
		requiresAuthentication: false;
		liveQuery: boolean;
	};
};

export type Mutations = {};

export type Subscriptions = {};

export type LiveQueries = {
	Recipe: {
		input: RecipeInput;
		data: RecipeResponseData;
		liveQuery: true;
		requiresAuthentication: false;
	};
	Recipes: {
		input: RecipesInput;
		data: RecipesResponseData;
		liveQuery: true;
		requiresAuthentication: false;
	};
};

export interface Operations
	extends OperationsDefinition<Queries, Mutations, Subscriptions, UserRole, keyof typeof AuthProviderId> {}
