import type {Constructor} from '@oscarpalmer/atoms/models';
import type {Schema} from '../schema';
import type {Validator} from '../validator';
import type {ExtractValueTypes, ValueType, Values} from './misc.model';

/**
 * A generic schematic allowing nested schematics, {@link SchematicEntry} values, or arrays of {@link SchematicEntry} as values
 */
export type PlainSchematic = {
	[key: string]: SchematicEntry | SchematicEntry[];
} & {
	$default?: never;
	$required?: never;
	$type?: never;
	$validators?: never;
};

/**
 * A schematic for validating objects
 *
 * @example
 * ```ts
 * const schematic = {
 *   name: 'string',
 *   age: 'number',
 *   tags: ['string', 'number'],
 * } satisfies Schematic;
 * ```
 */
export type Schematic = PlainSchematic;

/**
 * A union of all valid types for a single schematic entry
 *
 * Can be a {@link Constructor}, {@link PlainSchematic}, {@link SchematicProperty}, {@link Schema}, {@link ValueType}, or a custom validator function
 */
export type SchematicEntry =
	| Constructor
	| PlainSchematic
	| Schema<unknown>
	| SchematicProperty
	| Validator<unknown>
	| ValueType
	| ((value: unknown) => boolean);

/**
 * A property definition with explicit type(s), an optional requirement flag, and optional validators
 *
 * @example
 * ```ts
 * const prop: SchematicProperty = {
 *   $required: false,
 *   $type: ['string', 'number'],
 *   $validators: {
 *     string: (v) => v.length > 0,
 *     number: (v) => v > 0,
 *   },
 * };
 * ```
 */
export type SchematicProperty = {
	$default?: unknown;
	/**
	 * Whether the property is required _(defaults to `true`)_
	 */
	$required?: boolean;
	/**
	 * The type(s) the property value must match; a single {@link SchemaPropertyType} or an array
	 */
	$type: SchemaPropertyType | SchemaPropertyType[];
	/**
	 * Optional validators keyed by {@link ValueType}, applied during validation
	 */
	$validators?: PropertyValidators<SchemaPropertyType | SchemaPropertyType[]>;
};

/**
 * A union of valid types for a {@link SchematicProperty}'s `$type` field
 *
 * Can be a {@link Constructor}, {@link PlainSchematic}, {@link Schema}, {@link ValueType} string, or a custom validator function
 */
export type SchemaPropertyType =
	| Constructor
	| PlainSchematic
	| Schema<unknown>
	| Validator<unknown>
	| ValueType
	| ((value: unknown) => boolean);

/**
 * A map of optional validator functions keyed by {@link ValueType}, used to add custom validation to {@link SchemaProperty} definitions
 *
 * Each key may hold a single validator or an array of validators that receive the typed value
 *
 * @template Value `$type` value(s) to derive validator keys from
 *
 * @example
 * ```ts
 * const validators: PropertyValidators<'string'> = {
 *   string: (value) => value.length > 0,
 * };
 * ```
 */
export type PropertyValidators<Value> = {
	[Key in ExtractValueTypes<Value>]?:
		| ((value: Values[Key]) => boolean)
		| Array<(value: Values[Key]) => boolean>;
};
