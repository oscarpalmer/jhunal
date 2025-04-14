import type {
	OptionalKeysOf,
	RequiredKeysOf,
	Simplify,
	UnionToTuple,
} from 'type-fest';

export type GetKey<Value> = {
	[Key in keyof Values]: Value extends Values[Key] ? Key : never;
}[keyof Values];

export type GetTypes<Value extends unknown[]> = Value extends [infer Single]
	? Single
	: Value;

export type GetType<Value> = GetTypes<UnionToTuple<GetKey<Value>>>;

export type InferProperty<Value> = Value extends Property
	? Value['type'] extends keyof Values
		? Values[Value['type']]
		: Value['type'] extends (keyof Values)[]
			? Values[Value['type'][number]]
			: never
	: never;

export type InferValue<Value> = Value extends keyof Values
	? Values[Value]
	: Value extends (keyof Values)[]
		? Values[Value[number]]
		: never;

export type Inferred<Model extends Schema> = {
	[Key in InferredRequiredProperties<Model>]: Model[Key] extends Property
		? InferProperty<Model[Key]>
		: InferValue<Model[Key]>;
} & {
	[Key in InferredOptionalProperties<Model>]?: Model[Key] extends Property
		? InferProperty<Model[Key]>
		: never;
};

export type InferredOptionalProperties<Model extends Schema> = {
	[Key in keyof Model]: Model[Key] extends Property
		? Model[Key]['required'] extends false
			? Key
			: never
		: never;
}[keyof Model];

export type InferredRequiredProperties<Model extends Schema> = {
	[Key in keyof Model]: Model[Key] extends Property
		? Model[Key]['required'] extends false
			? never
			: Key
		: Key;
}[keyof Model];

export type OptionalProperty<Type> = {
	required: false;
	type: GetType<Type>;
};

export type Property = {
	required?: boolean;
	type: keyof Values | (keyof Values)[];
};

export type RequiredProperty<Type> = {
	required: true;
	type: GetType<Type>;
};

/**
 * A schema for validating objects
 */
export type Schema = Record<string, keyof Values | (keyof Values)[] | Property>;

/**
 * A schematic for validating objects
 */
export type Schematic<Model> = {
	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model;
};

export type Typed = Record<string, unknown>;

/**
 * A typed schema for validating objects
 */
export type TypedSchema<Model extends Typed> = Simplify<
	{
		[Key in RequiredKeysOf<Model>]:
			| GetType<Model[Key]>
			| RequiredProperty<Model[Key]>;
	} & {
		[Key in OptionalKeysOf<Model>]: OptionalProperty<Model[Key]>;
	}
>;

export type ValidatedProperty = {
	required: boolean;
	types: (keyof Values)[];
};

export type ValidatedSchema = {
	keys: string[];
	length: number;
	properties: Record<string, ValidatedProperty>;
};

export type Values = {
	array: unknown[];
	bigint: bigint;
	boolean: boolean;
	date: Date;
	// biome-ignore lint/complexity/noBannedTypes: it's the most basic value type, so I think it's ok
	function: Function;
	null: null;
	number: number;
	object: object;
	string: string;
	symbol: symbol;
	undefined: undefined;
};
