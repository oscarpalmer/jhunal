import type {PlainObject, Simplify} from '@oscarpalmer/atoms/models';
import type {Schematic} from './schematic';

export type Constructor<Instance = any> = new (...args: any[]) => Instance;

type DeduplicateTuple<Value extends unknown[], Seen extends unknown[] = []> = Value extends [
	infer Head,
	...infer Tail,
]
	? Head extends Seen[number]
		? DeduplicateTuple<Tail, Seen>
		: DeduplicateTuple<Tail, [...Seen, Head]>
	: Seen;

/**
 * Infer the TypeScript type from a schema definition
 */
export type Infer<Model extends Schema> = Simplify<
	{
		[Key in InferRequiredKeys<Model>]: InferSchemaEntry<Model[Key]>;
	} & {
		[Key in InferOptionalKeys<Model>]?: InferSchemaEntry<Model[Key]>;
	}
>;

type InferOptionalKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? Key : never]: never;
};

type InferPropertyType<Value> = Value extends (infer Item)[]
	? InferPropertyValue<Item>
	: InferPropertyValue<Value>;

type InferPropertyValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schematic<infer Model>
			? Model
			: Value extends ValueName
				? Values[Value & ValueName]
				: Value extends Schema
					? Infer<Value>
					: never;

type InferRequiredKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? never : Key]: never;
};

type InferSchemaEntry<Value> = Value extends (infer Item)[]
	? InferSchemaEntryValue<Item>
	: InferSchemaEntryValue<Value>;

type InferSchemaEntryValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schematic<infer Model>
			? Model
			: Value extends SchemaProperty
				? InferPropertyType<Value['$type']>
				: Value extends ValueName
					? Values[Value & ValueName]
					: Value extends Schema
						? Infer<Value>
						: never;

type IsOptionalProperty<Value> = Value extends SchemaProperty
	? Value['$required'] extends false
		? true
		: false
	: false;

type LastOfUnion<Value> =
	UnionToIntersection<Value extends unknown ? () => Value : never> extends () => infer Item
		? Item
		: never;

type MapToValueTypes<Value extends unknown[]> = Value extends [infer Head, ...infer Tail]
	? [ToValueType<Head>, ...MapToValueTypes<Tail>]
	: [];

type MapToSchemaPropertyTypes<Value extends unknown[]> = Value extends [infer Head, ...infer Tail]
	? [ToSchemaPropertyTypeEach<Head>, ...MapToSchemaPropertyTypes<Tail>]
	: [];

/**
 * A nested schema with optional requirement flag
 */
export type NestedSchema = {
	$required?: boolean;
} & Schema;

type OptionalKeys<Value> = {
	[Key in keyof Value]-?: {} extends Pick<Value, Key> ? Key : never;
}[keyof Value];

type RequiredKeys<Value> = Exclude<keyof Value, OptionalKeys<Value>>;

/**
 * A schema for validating objects
 */
export type Schema = SchemaIndex;

type SchemaEntry = Constructor | NestedSchema | SchemaProperty | Schematic<unknown> | ValueName;

interface SchemaIndex {
	[key: string]: SchemaEntry | SchemaEntry[];
}

/**
 * A property definition with explicit type(s) and optional requirement flag
 */
export type SchemaProperty = {
	$required?: boolean;
	$type: SchemaPropertyType | SchemaPropertyType[];
};

type SchemaPropertyType = Constructor | Schema | Schematic<unknown> | ValueName;

type ToSchemaPropertyType<Value> = UnwrapSingle<
	DeduplicateTuple<MapToSchemaPropertyTypes<UnionToTuple<Value>>>
>;

type ToSchemaPropertyTypeEach<Value> = Value extends PlainObject
	? TypedSchema<Value>
	: ToValueType<Value>;

type ToSchemaType<Value> = UnwrapSingle<DeduplicateTuple<MapToValueTypes<UnionToTuple<Value>>>>;

type ToValueType<Value> = Value extends unknown[]
	? 'array'
	: Value extends bigint
		? 'bigint'
		: Value extends boolean
			? 'boolean'
			: Value extends Date
				? 'date'
				: Value extends Function
					? 'function'
					: Value extends null
						? 'null'
						: Value extends number
							? 'number'
							: Value extends object
								? 'object' | ((value: unknown) => value is Value)
								: Value extends string
									? 'string'
									: Value extends symbol
										? 'symbol'
										: Value extends undefined
											? 'undefined'
											: (value: unknown) => value is Value;

type TuplePermutations<
	Tuple extends unknown[],
	Elput extends unknown[] = [],
> = Tuple['length'] extends 0
	? Elput
	: {
			[Key in keyof Tuple]: TuplePermutations<
				TupleRemoveAt<Tuple, Key & `${number}`>,
				[...Elput, Tuple[Key]]
			>;
		}[keyof Tuple & `${number}`];

type TupleRemoveAt<
	Items extends unknown[],
	Item extends string,
	Prefix extends unknown[] = [],
> = Items extends [infer Head, ...infer Tail]
	? `${Prefix['length']}` extends Item
		? [...Prefix, ...Tail]
		: TupleRemoveAt<Tail, Item, [...Prefix, Head]>
	: Prefix;

export type TypedPropertyOptional<Value> = {
	$required: false;
	$type: ToSchemaPropertyType<Exclude<Value, undefined>>;
};

export type TypedPropertyRequired<Value> = {
	$required?: true;
	$type: ToSchemaPropertyType<Value>;
};

/**
 * Create a schema type constrained to match a TypeScript type
 */
export type TypedSchema<Model extends PlainObject> = Simplify<
	{
		[Key in RequiredKeys<Model>]: Model[Key] extends PlainObject
			? TypedSchemaRequired<Model[Key]>
			: ToSchemaType<Model[Key]> | TypedPropertyRequired<Model[Key]>;
	} & {
		[Key in OptionalKeys<Model>]: Exclude<Model[Key], undefined> extends PlainObject
			? TypedSchemaOptional<Exclude<Model[Key], undefined>>
			: TypedPropertyOptional<Model[Key]>;
	}
>;

type TypedSchemaOptional<Model extends PlainObject> = {
	$required: false;
} & TypedSchema<Model>;

type TypedSchemaRequired<Model extends PlainObject> = {
	$required?: true;
} & TypedSchema<Model>;

type UnionToIntersection<Value> = (Value extends unknown ? (value: Value) => void : never) extends (
	value: infer Item,
) => void
	? Item
	: never;

type UnionToTuple<Value, Items extends unknown[] = []> = [Value] extends [never]
	? Items
	: UnionToTuple<Exclude<Value, LastOfUnion<Value>>, [LastOfUnion<Value>, ...Items]>;

type UnwrapSingle<Value extends unknown[]> = Value extends [infer Only]
	? Only
	: Value['length'] extends 1 | 2 | 3 | 4 | 5
		? TuplePermutations<Value>
		: Value;

export type ValidatedProperty = {
	required: boolean;
	types: ValidatedPropertyType[];
};

export type ValidatedPropertyType = Schematic<unknown> | ValueName;

export type ValidatedSchema = {
	enabled: boolean;
	keys: {
		array: string[];
		set: Set<string>;
	};
	properties: Record<string, ValidatedProperty>;
};

/**
 * Valid type name strings
 */
export type ValueName = keyof Values;

/**
 * Map of type names to their TypeScript/validatable equivalents
 */
export type Values = {
	array: unknown[];
	bigint: bigint;
	boolean: boolean;
	date: Date;
	function: Function;
	null: null;
	number: number;
	object: object;
	string: string;
	symbol: symbol;
	undefined: undefined;
};
