import type {SchematicProperty} from './schematic.plain.model';

/**
 * Removes duplicate types from a tuple, preserving first occurrence order
 *
 * @template Value Tuple to deduplicate
 * @template Seen Accumulator for already-seen types _(internal)_
 *
 * @example
 * ```ts
 * // DeduplicateTuple<['string', 'number', 'string']>
 * // => ['string', 'number']
 * ```
 */
export type DeduplicateTuple<Value extends unknown[], Seen extends unknown[] = []> = Value extends [
	infer Head,
	...infer Tail,
]
	? Head extends Seen[number]
		? DeduplicateTuple<Tail, Seen>
		: DeduplicateTuple<Tail, [...Seen, Head]>
	: Seen;

/**
 * Recursively extracts {@link ValueType} strings from a type, unwrapping arrays and readonly arrays
 *
 * @template Value Type to extract value types from
 *
 * @example
 * ```ts
 * // ExtractValueTypes<'string'>         => 'string'
 * // ExtractValueTypes<['string', 'number']> => 'string' | 'number'
 * ```
 */
export type ExtractValueTypes<Value> = Value extends ValueType
	? Value
	: Value extends (infer Item)[]
		? ExtractValueTypes<Item>
		: Value extends readonly (infer Item)[]
			? ExtractValueTypes<Item>
			: never;

/**
 * Determines whether a schema entry is optional
 *
 * Returns `true` if the entry is a {@link SchematicProperty} with `$required` set to `false`; otherwise returns `false`
 *
 * @template Value Schema entry to check
 */
export type IsOptionalProperty<Value> = Value extends SchematicProperty
	? Value['$required'] extends false
		? true
		: false
	: false;

/**
 * Extracts the last member from a union type by leveraging contravariance of function parameter types
 *
 * @template Value Union type
 */
export type LastOfUnion<Value> =
	UnionToIntersection<Value extends unknown ? () => Value : never> extends () => infer Item
		? Item
		: never;

/**
 * Extracts keys from an object type that are optional
 *
 * @template Value Object type to inspect
 */
export type OptionalKeys<Value> = {
	[Key in keyof Value]-?: {} extends Pick<Value, Key> ? Key : never;
}[keyof Value];

/**
 * Extracts keys from an object type that are required _(i.e., not optional)_
 *
 * @template Value Object type to inspect
 */
export type RequiredKeys<Value> = Exclude<keyof Value, OptionalKeys<Value>>;

/**
 * Generates all permutations of a tuple type
 *
 * Used by {@link UnwrapSingle} to allow schema types in any order for small tuples _(length ≤ 5)_
 *
 * @template Tuple Tuple to permute
 * @template Elput Accumulator for the current permutation _(internal; name is Tuple backwards)_
 *
 * @example
 * ```ts
 * // TuplePermutations<['string', 'number']>
 * // => ['string', 'number'] | ['number', 'string']
 * ```
 */
export type TuplePermutations<
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
 * @template Items Tuple to remove from
 * @template Item Index as a string literal
 * @template Prefix Accumulator for elements before the target _(internal)_
 */
export type TupleRemoveAt<
	Items extends unknown[],
	Item extends string,
	Prefix extends unknown[] = [],
> = Items extends [infer Head, ...infer Tail]
	? `${Prefix['length']}` extends Item
		? [...Prefix, ...Tail]
		: TupleRemoveAt<Tail, Item, [...Prefix, Head]>
	: Prefix;

/**
 * Converts a union type into an intersection
 *
 * Uses the contravariance of function parameter types to collapse a union into an intersection
 *
 * @template Value Union type to convert
 *
 * @example
 * ```ts
 * // UnionToIntersection<{ a: 1 } | { b: 2 }>
 * // => { a: 1 } & { b: 2 }
 * ```
 */
export type UnionToIntersection<Value> = (
	Value extends unknown ? (value: Value) => void : never
) extends (value: infer Item) => void
	? Item
	: never;

/**
 * Converts a union type into an ordered tuple
 *
 * Repeatedly extracts the {@link LastOfUnion} member and prepends it to the accumulator
 *
 * @template Value Union type to convert
 * @template Items Accumulator for the resulting tuple _(internal)_
 *
 * @example
 * ```ts
 * // UnionToTuple<'a' | 'b' | 'c'>
 * // => ['a', 'b', 'c']
 * ```
 */
export type UnionToTuple<Value, Items extends unknown[] = []> = [Value] extends [never]
	? Items
	: UnionToTuple<Exclude<Value, LastOfUnion<Value>>, [LastOfUnion<Value>, ...Items]>;

/**
 * Unwraps a single-element tuple to its inner type
 *
 * For tuples of length 2–5, returns all {@link TuplePermutations} to allow types in any order. Longer tuples are returned as-is
 *
 * @template Value Tuple to potentially unwrap
 *
 * @example
 * ```ts
 * // UnwrapSingle<['string']>            => 'string'
 * // UnwrapSingle<['string', 'number']>  => ['string', 'number'] | ['number', 'string']
 * ```
 */
export type UnwrapSingle<Value extends unknown[]> = Value extends [infer Only]
	? Only
	: Value['length'] extends 1 | 2 | 3 | 4 | 5
		? TuplePermutations<Value>
		: Value;

/**
 * A union of valid type name strings, e.g. `'string'`, `'number'`, `'date'`
 */
export type ValueType = keyof Values;

/**
 * Maps {@link ValueType} strings to their TypeScript equivalents
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
