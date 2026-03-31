import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Schema} from '../schema';
import type {DeduplicateTuple, UnionToTuple, UnwrapSingle, Values} from './misc.model';
import type {TypedSchematic} from './schematic.typed.model';

/**
 * Maps each element of a tuple through {@link ToValueType}
 *
 * @template Value Tuple of types to map
 */
export type MapToValueTypes<Value extends unknown[]> = Value extends [infer Head, ...infer Tail]
	? [ToValueType<Head>, ...MapToValueTypes<Tail>]
	: [];

/**
 * Maps each element of a tuple through {@link ToSchemaPropertyTypeEach}
 *
 * @template Value Tuple of types to map
 */
export type MapToSchemaPropertyTypes<Value extends unknown[]> = Value extends [
	infer Head,
	...infer Tail,
]
	? [ToSchemaPropertyTypeEach<Head>, ...MapToSchemaPropertyTypes<Tail>]
	: [];

/**
 * Converts a TypeScript type to its {@link SchemaPropertyType} representation, suitable for use in a typed schema
 *
 * @template Value Type to convert
 */
export type ToSchemaPropertyType<Value> = UnwrapSingle<
	DeduplicateTuple<MapToSchemaPropertyTypes<UnionToTuple<Value>>>
>;

/**
 * Converts a single type to its schema property equivalent
 *
 * Plain objects become {@link TypedSchematic}; primitives go through {@link ToValueType}
 *
 * @template Value Type to convert
 */
export type ToSchemaPropertyTypeEach<Value> = Value extends PlainObject
	? TypedSchematic<Value>
	: ToValueType<Value>;

/**
 * Converts a TypeScript type to its {@link ValueName} representation, suitable for use as a top-level schema entry
 *
 * @template Value Type to convert
 */
export type ToSchemaType<Value> = UnwrapSingle<
	DeduplicateTuple<MapToValueTypes<UnionToTuple<Value>>>
>;

/**
 * Maps a type to its {@link ValueName} string equivalent
 *
 * Resolves {@link Schema} types as-is, then performs a reverse-lookup against {@link Values} _(excluding `'object'`)_ to find a matching key. If no match is found, `object` types resolve to `'object'` or a type-guard function, and all other unrecognised types resolve to a type-guard function
 *
 * @template Value Type to map
 *
 * @example
 * ```ts
 * // ToValueType<string>    => 'string'
 * // ToValueType<number[]>  => 'array'
 * // ToValueType<Date>      => 'date'
 * ```
 */
export type ToValueType<Value> =
	Value extends Schema<any>
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
