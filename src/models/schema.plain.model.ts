import type {Constructor} from '@oscarpalmer/atoms/models';
import type {Schematic} from '../schematic';
import type {ExtractValueNames, ValueName, Values} from './misc.model';

/**
 * A generic schema allowing nested schemas, {@link SchemaEntry} values, or arrays of {@link SchemaEntry} as values
 */
export type PlainSchema = {
	[key: string]: PlainSchema | SchemaEntry | SchemaEntry[] | undefined;
} & {
	$required?: never;
	$type?: never;
	$validators?: never;
};

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
export type Schema = PlainSchema;

/**
 * A union of all valid types for a single schema entry
 *
 * Can be a {@link Constructor}, {@link PlainSchema}, {@link SchemaProperty}, {@link Schematic}, {@link ValueName} string, or a custom validator function
 */
export type SchemaEntry =
	| Constructor
	| PlainSchema
	| SchemaProperty
	| Schematic<unknown>
	| ValueName
	| ((value: unknown) => boolean);

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
export type SchemaPropertyType =
	| Constructor
	| PlainSchema
	| Schematic<unknown>
	| ValueName
	| ((value: unknown) => boolean);

/**
 * A map of optional validator functions keyed by {@link ValueName}, used to add custom validation to {@link SchemaProperty} definitions
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
	[Key in ExtractValueNames<Value>]?:
		| ((value: Values[Key]) => boolean)
		| Array<(value: Values[Key]) => boolean>;
};
