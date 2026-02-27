import type {Constructor, GenericCallback, PlainObject, Simplify} from '@oscarpalmer/atoms/models';
import {ERROR_NAME} from './constants';
import type {Schematic} from './schematic';

/**
 * Removes duplicate types from a tuple, preserving first occurrence order
 *
 * @template Value - Tuple to deduplicate
 * @template Seen - Accumulator for already-seen types _(internal)_
 *
 * @example
 * ```ts
 * // DeduplicateTuple<['string', 'number', 'string']>
 * // => ['string', 'number']
 * ```
 */
type DeduplicateTuple<Value extends unknown[], Seen extends unknown[] = []> = Value extends [
	infer Head,
	...infer Tail,
]
	? Head extends Seen[number]
		? DeduplicateTuple<Tail, Seen>
		: DeduplicateTuple<Tail, [...Seen, Head]>
	: Seen;

/**
 * Recursively extracts {@link ValueName} strings from a type, unwrapping arrays and readonly arrays
 *
 * @template Value - Type to extract value names from
 *
 * @example
 * ```ts
 * // ExtractValueNames<'string'>         => 'string'
 * // ExtractValueNames<['string', 'number']> => 'string' | 'number'
 * ```
 */
type ExtractValueNames<Value> = Value extends ValueName
	? Value
	: Value extends (infer Item)[]
		? ExtractValueNames<Item>
		: Value extends readonly (infer Item)[]
			? ExtractValueNames<Item>
			: never;

/**
 * Infers the TypeScript type from a {@link Schema} definition
 *
 * @template Model - Schema to infer types from
 *
 * @example
 * ```ts
 * const userSchema = {
 *   name: 'string',
 *   age: 'number',
 *   address: { $required: false, $type: 'string' },
 * } satisfies Schema;
 *
 * type User = Infer<typeof userSchema>;
 * // { name: string; age: number; address?: string }
 * ```
 */
export type Infer<Model extends Schema> = Simplify<
	{
		[Key in InferRequiredKeys<Model>]: InferSchemaEntry<Model[Key]>;
	} & {
		[Key in InferOptionalKeys<Model>]?: InferSchemaEntry<Model[Key]>;
	}
>;

/**
 * Extracts keys from a {@link Schema} whose entries are optional _(i.e., `$required` is `false`)_
 *
 * @template Model - {@link Schema} to extract optional keys from
 */
type InferOptionalKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? Key : never]: never;
};

/**
 * Infers the TypeScript type of a {@link SchemaProperty}'s `$type` field, unwrapping arrays to infer their item type
 *
 * @template Value - `$type` value _(single or array)_
 */
type InferPropertyType<Value> = Value extends (infer Item)[]
	? InferPropertyValue<Item>
	: InferPropertyValue<Value>;

/**
 * Maps a single type definition to its TypeScript equivalent
 *
 * Resolves, in order: {@link Constructor} instances, {@link Schematic} models, {@link ValueName} strings, and nested {@link Schema} objects
 *
 * @template Value - single type definition
 */
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

/**
 * Extracts keys from a {@link Schema} whose entries are required _(i.e., `$required` is not `false`)_
 *
 * @template Model - Schema to extract required keys from
 */
type InferRequiredKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? never : Key]: never;
};

/**
 * Infers the type for a top-level {@link Schema} entry, unwrapping arrays to infer their item type
 *
 * @template Value - Schema entry value _(single or array)_
 */
type InferSchemaEntry<Value> = Value extends (infer Item)[]
	? InferSchemaEntryValue<Item>
	: InferSchemaEntryValue<Value>;

/**
 * Resolves a single schema entry to its TypeScript type
 *
 * Handles, in order: {@link Constructor} instances, {@link Schematic} models, {@link SchemaProperty} objects, {@link NestedSchema} objects, {@link ValueName} strings, and plain {@link Schema} objects
 *
 * @template Value - single schema entry
 */
type InferSchemaEntryValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schematic<infer Model>
			? Model
			: Value extends SchemaProperty
				? InferPropertyType<Value['$type']>
				: Value extends NestedSchema
					? Infer<Omit<Value, '$required'>>
					: Value extends ValueName
						? Values[Value & ValueName]
						: Value extends Schema
							? Infer<Value>
							: never;

/**
 * Determines whether a schema entry is optional
 *
 * Returns `true` if the entry is a {@link SchemaProperty} or {@link NestedSchema} with `$required` set to `false`; otherwise returns `false`
 *
 * @template Value - Schema entry to check
 */
type IsOptionalProperty<Value> = Value extends SchemaProperty
	? Value['$required'] extends false
		? true
		: false
	: Value extends {$required?: boolean}
		? Value extends {$required: false}
			? true
			: false
		: false;

/**
 * Extracts the last member from a union type by leveraging intersection of function return types
 *
 * @template Value - Union type
 */
type LastOfUnion<Value> =
	UnionToIntersection<Value extends unknown ? () => Value : never> extends () => infer Item
		? Item
		: never;

/**
 * Maps each element of a tuple through {@link ToValueType}
 *
 * @template Value - Tuple of types to map
 */
type MapToValueTypes<Value extends unknown[]> = Value extends [infer Head, ...infer Tail]
	? [ToValueType<Head>, ...MapToValueTypes<Tail>]
	: [];

/**
 * Maps each element of a tuple through {@link ToSchemaPropertyTypeEach}
 *
 * @template Value - Tuple of types to map
 */
type MapToSchemaPropertyTypes<Value extends unknown[]> = Value extends [infer Head, ...infer Tail]
	? [ToSchemaPropertyTypeEach<Head>, ...MapToSchemaPropertyTypes<Tail>]
	: [];

/**
 * A nested schema definition that may include a `$required` flag alongside arbitrary string-keyed properties
 *
 * @example
 * ```ts
 * const address: NestedSchema = {
 *   $required: false,
 *   street: 'string',
 *   city: 'string',
 * };
 * ```
 */
export type NestedSchema = {
	/**
	 * Whether the nested schema is required (defaults to `true`)
	 */
	$required?: boolean;
} & Schema;

/**
 * Extracts keys from an object type that are optional
 *
 * @template Value - Object type to inspect
 */
type OptionalKeys<Value> = {
	[Key in keyof Value]-?: {} extends Pick<Value, Key> ? Key : never;
}[keyof Value];

/**
 * A generic schema allowing {@link NestedSchema}, {@link SchemaEntry}, or arrays of {@link SchemaEntry} as values
 */
type PlainSchema = {
	[key: string]: NestedSchema | SchemaEntry | SchemaEntry[];
};

/**
 * A map of optional validator functions keyed by {@link ValueName}, used to add custom validation to {@link SchemaProperty} definitions
 *
 * Each key may hold a single validator or an array of validators that receive the typed value
 *
 * @template Value - `$type` value(s) to derive validator keys from
 *
 * @example
 * ```ts
 * const validators: PropertyValidators<'string'> = {
 *   string: (value) => value.length > 0,
 * };
 * ```
 */
type PropertyValidators<Value> = {
	[Key in ExtractValueNames<Value>]?:
		| ((value: Values[Key]) => boolean)
		| Array<(value: Values[Key]) => boolean>;
};

/**
 * Extracts keys from an object type that are required _(i.e., not optional)_
 *
 * @template Value - Object type to inspect
 */
type RequiredKeys<Value> = Exclude<keyof Value, OptionalKeys<Value>>;

/**
 * A schema for validating objects
 *
 * @example
 * ```ts
 * const schema: Schema = {
 *   name: 'string',
 *   age: 'number',
 *   tags: ['string', 'number'],
 * };
 * ```
 */
export type Schema = SchemaIndex;

/**
 * A union of all valid types for a single schema entry
 *
 * Can be a {@link Constructor}, nested {@link Schema}, {@link SchemaProperty}, {@link Schematic}, {@link ValueName} string, or a custom validator function
 */
type SchemaEntry =
	| Constructor
	| Schema
	| SchemaProperty
	| Schematic<unknown>
	| ValueName
	| ((value: unknown) => boolean);

/**
 * Index signature interface backing {@link Schema}, allowing string-keyed entries of {@link NestedSchema}, {@link SchemaEntry}, or arrays of {@link SchemaEntry}
 */
interface SchemaIndex {
	[key: string]: NestedSchema | SchemaEntry | SchemaEntry[];
}

/**
 * A property definition with explicit type(s), an optional requirement flag, and optional validators
 *
 * @example
 * ```ts
 * const prop: SchemaProperty = {
 *   $required: false,
 *   $type: ['string', 'number'],
 *   $validators: {
 *     string: (v) => v.length > 0,
 *     number: (v) => v > 0,
 *   },
 * };
 * ```
 */
export type SchemaProperty = {
	/**
	 * Whether the property is required _(defaults to `true`)_
	 */
	$required?: boolean;
	/**
	 * The type(s) the property value must match; a single {@link SchemaPropertyType} or an array
	 */
	$type: SchemaPropertyType | SchemaPropertyType[];
	/**
	 * Optional validators keyed by {@link ValueName}, applied during validation
	 */
	$validators?: PropertyValidators<SchemaPropertyType | SchemaPropertyType[]>;
};

/**
 * A union of valid types for a {@link SchemaProperty}'s `$type` field
 *
 * Can be a {@link Constructor}, {@link PlainSchema}, {@link Schematic}, {@link ValueName} string, or a custom validator function
 */
type SchemaPropertyType =
	| Constructor
	| PlainSchema
	| Schematic<unknown>
	| ValueName
	| ((value: unknown) => boolean);

/**
 * A custom error class for schema validation failures, with its `name` set to {@link ERROR_NAME}
 *
 * @example
 * ```ts
 * throw new SchematicError('Expected a string, received a number');
 * ```
 */
export class SchematicError extends Error {
	constructor(message: string) {
		super(message);

		this.name = ERROR_NAME;
	}
}

/**
 * Converts a type into its corresponding {@link SchemaPropertyType}-representation
 *
 * Deduplicates and unwraps single-element tuples via {@link UnwrapSingle}
 *
 * @template Value - type to convert
 */
type ToSchemaPropertyType<Value> = UnwrapSingle<
	DeduplicateTuple<MapToSchemaPropertyTypes<UnionToTuple<Value>>>
>;

/**
 * Converts a single type to its schema property equivalent
 *
 * {@link NestedSchema} values have `$required` stripped, plain objects become {@link TypedSchema}, and primitives go through {@link ToValueType}
 *
 * @template Value - type to convert
 */
type ToSchemaPropertyTypeEach<Value> = Value extends NestedSchema
	? Omit<Value, '$required'>
	: Value extends PlainObject
		? TypedSchema<Value>
		: ToValueType<Value>;

/**
 * Converts a type into its corresponding {@link ValueName}-representation
 *
 * Deduplicates and unwraps single-element tuples via {@link UnwrapSingle}
 *
 * @template Value - type to convert
 */
type ToSchemaType<Value> = UnwrapSingle<DeduplicateTuple<MapToValueTypes<UnionToTuple<Value>>>>;

/**
 * Maps a type to its {@link ValueName} string equivalent
 *
 * Resolves {@link Schematic} types as-is, then performs a reverse-lookup against {@link Values} _(excluding `'object'`)_ to find a matching key. If no match is found, `object` types resolve to `'object'` or a type-guard function, and all other unrecognised types resolve to a type-guard function
 *
 * @template Value - type to map
 *
 * @example
 * ```ts
 * // ToValueType<string>    => 'string'
 * // ToValueType<number[]>  => 'array'
 * // ToValueType<Date>      => 'date'
 * ```
 */
type ToValueType<Value> =
	Value extends Schematic<any>
		? Value
		: {
					[Key in keyof Omit<Values, 'object'>]: Value extends Values[Key] ? Key : never;
			  }[keyof Omit<Values, 'object'>] extends infer Match
			? [Match] extends [never]
				? Value extends object
					? 'object' | ((value: unknown) => value is Value)
					: (value: unknown) => value is Value
				: Match
			: never;

/**
 * Generates all permutations of a tuple type
 *
 * Used by {@link UnwrapSingle} to allow schema types in any order for small tuples _(length ≤ 5)_
 *
 * @template Tuple - Tuple to permute
 * @template Elput - Accumulator for the current permutation _(internal; name is Tuple backwards)_
 *
 * @example
 * ```ts
 * // TuplePermutations<['string', 'number']>
 * // => ['string', 'number'] | ['number', 'string']
 * ```
 */
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

/**
 * Removes the element at a given index from a tuple
 *
 * Used internally by {@link TuplePermutations}
 *
 * @template Items - Tuple to remove from
 * @template Item - Stringified index to remove
 * @template Prefix - Accumulator for elements before the target _(internal)_
 */
type TupleRemoveAt<
	Items extends unknown[],
	Item extends string,
	Prefix extends unknown[] = [],
> = Items extends [infer Head, ...infer Tail]
	? `${Prefix['length']}` extends Item
		? [...Prefix, ...Tail]
		: TupleRemoveAt<Tail, Item, [...Prefix, Head]>
	: Prefix;

/**
 * A typed optional property definition generated by {@link TypedSchema} for optional keys, with `$required` set to `false` and excludes `undefined` from the type
 *
 * @template Value - Property's type _(including `undefined`)_
 *
 * @example
 * ```ts
 * // For `{ name?: string }`, the `name` key produces:
 * // TypedPropertyOptional<string | undefined>
 * // => { $required: false; $type: 'string'; ... }
 * ```
 */
export type TypedPropertyOptional<Value> = {
	/**
	 * The property is not required
	 */
	$required: false;
	/**
	 * The type(s) of the property
	 */
	$type: ToSchemaPropertyType<Exclude<Value, undefined>>;
	/**
	 * Custom validators for the property and its types
	 */
	$validators?: PropertyValidators<ToSchemaPropertyType<Exclude<Value, undefined>>>;
};

/**
 * A typed required property definition generated by {@link TypedSchema} for required keys, with `$required` defaulting to `true`
 *
 * @template Value - Property's type
 *
 * @example
 * ```ts
 * // For `{ name: string }`, the `name` key produces:
 * // TypedPropertyRequired<string>
 * // => { $required?: true; $type: 'string'; ... }
 * ```
 */
export type TypedPropertyRequired<Value> = {
	/**
	 * The property is required _(defaults to `true`)_
	 */
	$required?: true;
	/**
	 * The type(s) of the property
	 */
	$type: ToSchemaPropertyType<Value>;
	/**
	 * Custom validators for the property and its types
	 */
	$validators?: PropertyValidators<ToSchemaPropertyType<Value>>;
};

/**
 * Creates a schema type constrained to match a TypeScript type
 *
 * Required keys map to {@link ToSchemaType} or {@link TypedPropertyRequired}; plain object values may also use {@link Schematic}. Optional keys map to {@link TypedPropertyOptional} or, for plain objects, {@link TypedSchemaOptional}
 *
 * @template Model - Object type to generate a schema for
 *
 * @example
 * ```ts
 * type User = { name: string; age: number; bio?: string };
 *
 * const schema: TypedSchema<User> = {
 *   name: 'string',
 *   age: 'number',
 *   bio: { $required: false, $type: 'string' },
 * };
 * ```
 */
export type TypedSchema<Model extends PlainObject> = Simplify<
	{
		[Key in RequiredKeys<Model>]: Model[Key] extends PlainObject
			? TypedSchemaRequired<Model[Key]> | Schematic<Model[Key]>
			: ToSchemaType<Model[Key]> | TypedPropertyRequired<Model[Key]>;
	} & {
		[Key in OptionalKeys<Model>]: Exclude<Model[Key], undefined> extends PlainObject
			?
					| TypedSchemaOptional<Exclude<Model[Key], undefined>>
					| Schematic<Exclude<Model[Key], undefined>>
			: TypedPropertyOptional<Model[Key]>;
	}
>;

/**
 * A {@link TypedSchema} variant for optional nested objects, with `$required` fixed to `false`
 *
 * @template Model - Nested object type
 */
type TypedSchemaOptional<Model extends PlainObject> = {
	$required: false;
} & TypedSchema<Model>;

/**
 * A {@link TypedSchema} variant for required nested objects, with `$required` defaulting to `true`
 *
 * @template Model - Nested object type
 */
type TypedSchemaRequired<Model extends PlainObject> = {
	$required?: true;
} & TypedSchema<Model>;

/**
 * Converts a union type into an intersection
 *
 * Uses the contravariance of function parameter types to collapse a union into an intersection
 *
 * @template Value - Union type to convert
 *
 * @example
 * ```ts
 * // UnionToIntersection<{ a: 1 } | { b: 2 }>
 * // => { a: 1 } & { b: 2 }
 * ```
 */
type UnionToIntersection<Value> = (Value extends unknown ? (value: Value) => void : never) extends (
	value: infer Item,
) => void
	? Item
	: never;

/**
 * Converts a union type into an ordered tuple
 *
 * Repeatedly extracts the {@link LastOfUnion} member and prepends it to the accumulator
 *
 * @template Value - Union type to convert
 * @template Items - Accumulator for the resulting tuple _(internal)_
 *
 * @example
 * ```ts
 * // UnionToTuple<'a' | 'b' | 'c'>
 * // => ['a', 'b', 'c']
 * ```
 */
type UnionToTuple<Value, Items extends unknown[] = []> = [Value] extends [never]
	? Items
	: UnionToTuple<Exclude<Value, LastOfUnion<Value>>, [LastOfUnion<Value>, ...Items]>;

/**
 * Unwraps a single-element tuple to its inner type
 *
 * For tuples of length 2–5, returns all {@link TuplePermutations} to allow types in any order. Longer tuples are returned as-is
 *
 * @template Value - Tuple to potentially unwrap
 *
 * @example
 * ```ts
 * // UnwrapSingle<['string']>            => 'string'
 * // UnwrapSingle<['string', 'number']>  => ['string', 'number'] | ['number', 'string']
 * ```
 */
type UnwrapSingle<Value extends unknown[]> = Value extends [infer Only]
	? Only
	: Value['length'] extends 1 | 2 | 3 | 4 | 5
		? TuplePermutations<Value>
		: Value;

/**
 * The runtime representation of a parsed schema property, used internally during validation
 *
 * @example
 * ```ts
 * const parsed: ValidatedProperty = {
 *   key: 'age',
 *   required: true,
 *   types: ['number'],
 *   validators: { number: [(v) => v > 0] },
 * };
 * ```
 */
export type ValidatedProperty = {
	/**
	 * The property name in the schema
	 */
	key: string;
	/**
	 * Whether the property is required
	 */
	required: boolean;
	/**
	 * The allowed types for this property
	 */
	types: ValidatedPropertyType[];
	/**
	 * Custom validators grouped by {@link ValueName}
	 */
	validators: ValidatedPropertyValidators;
};

/**
 * A union of valid types for a {@link ValidatedProperty}'s `types` array
 *
 * Can be a callback _(custom validator)_, a {@link Schematic}, a nested {@link ValidatedProperty}, or a {@link ValueName} string
 */
export type ValidatedPropertyType =
	| GenericCallback
	| Schematic<unknown>
	| ValidatedProperty
	| ValueName;

/**
 * A map of validator functions keyed by {@link ValueName}, used at runtime in {@link ValidatedProperty}
 *
 * Each key holds an array of validator functions that receive an `unknown` value and return a `boolean`
 */
export type ValidatedPropertyValidators = {
	[Key in ValueName]?: Array<(value: unknown) => boolean>;
};

/**
 * Basic value types
 */
export type ValueName = keyof Values;

/**
 * Maps type name strings to their TypeScript equivalents
 *
 * Used by the type system to resolve {@link ValueName} strings into actual types
 *
 * @example
 * ```ts
 * // Values['string']  => string
 * // Values['date']    => Date
 * // Values['null']    => null
 * ```
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
