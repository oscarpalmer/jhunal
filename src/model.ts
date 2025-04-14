import type {
	OptionalKeysOf,
	RequiredKeysOf,
	Simplify,
	UnionToTuple,
} from 'type-fest';

export type AutoInferExclude = 'date-like' | 'numerical';

export type GetKey<Value> = {
		[Key in Exclude<ValueKey, AutoInferExclude>]: Value extends Values[Key]
			? Key
			: never;
	}[Exclude<ValueKey, AutoInferExclude>] extends infer SpecificKey
		? SpecificKey extends never
			? {
					[Key in AutoInferExclude]: Value extends Values[Key] ? Key : never;
				}[AutoInferExclude]
			: SpecificKey
		: never;

export type GetTypes<Value extends unknown[]> = Value extends [infer Type]
	? Type
	: Value;

export type GetType<Value> = GetTypes<UnionToTuple<GetKey<Value>>>;

export type InferProperty<Value> = Value extends Property
	? InferPropertyType<Value['type']>
	: never;

type InferPropertyType<Value> = Value extends (infer Type)[]
	? InferPropertyTypeValue<Type>[]
	: InferPropertyTypeValue<Value>;

type InferPropertyTypeValue<Value> = Value extends PropertyType
	? Value extends Schema
		? Inferred<Value>
		: Value extends Schematic<infer Model>
			? Model
			: Value extends ValueKey
				? Values[Value]
				: Value extends (infer NestedElementType)[]
					? InferPropertyTypeValue<NestedElementType>[]
					: Value
	: never;

export type InferValue<Value> = Value extends ValueKey
	? Values[Value]
	: Value extends ValueKey[]
		? Values[Value[number]]
		: never;

export type Inferred<Model extends Schema> = Simplify<
	{
		[Key in InferredRequiredProperties<Model>]: Model[Key] extends Property
			? InferProperty<Model[Key]>
			: InferValue<Model[Key]>;
	} & {
		[Key in InferredOptionalProperties<Model>]?: Model[Key] extends Property
			? InferProperty<Model[Key]>
			: never;
	}
>;

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
		type: PropertyType | PropertyType[];
	};

type PropertyType = Schema | Schematic<unknown> | ValueKey;

export type RequiredProperty<Type> = {
	required: true;
	type: GetType<Type>;
};

/**
 * A schema for validating objects
 */
export type Schema = {
	[key: string]: Property | ValueKey | ValueKey[];
};

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
		types: ValidatedPropertyType[];
	};

export type ValidatedPropertyType =
	| Schematic<unknown>
	| ValidatedSchema
	| ValueKey;

export type ValidatedSchema = {
		keys: string[];
		length: number;
		properties: ValidatedSchemaProperties;
	};

type ValidatedSchemaProperties = {
	[key: string]: ValidatedProperty;
};

export type ValueKey = keyof Values;

export type Values = {
		array: unknown[];
		bigint: bigint;
		boolean: boolean;
		date: Date;
		'date-like': number | string | Date;
		// biome-ignore lint/complexity/noBannedTypes: it's the most basic value type, so I think it's ok
		function: Function;
		null: null;
		number: number;
		numerical: bigint | number;
		object: object;
		string: string;
		symbol: symbol;
		undefined: undefined;
	};
