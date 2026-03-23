import type {Constructor} from '@oscarpalmer/atoms/models';
import type {Schematic} from '../schematic';
import type {ValueName} from './misc.model';
import type {PropertyValidators} from './validation.model';

/**
 * A generic schema allowing {@link NestedSchema}, {@link SchemaEntry}, or arrays of {@link SchemaEntry} as values
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
export type Schema = SchemaIndex;

/**
 * A union of all valid types for a single schema entry
 *
 * Can be a {@link Constructor}, nested {@link Schema}, {@link SchemaProperty}, {@link Schematic}, {@link ValueName} string, or a custom validator function
 */
export type SchemaEntry =
	| Constructor
	| PlainSchema
	| SchemaProperty
	| Schematic<unknown>
	| ValueName
	| ((value: unknown) => boolean);

/**
 * Index signature interface backing {@link Schema}, allowing string-keyed entries of {@link NestedSchema}, {@link SchemaEntry}, or arrays of {@link SchemaEntry}
 */
export interface SchemaIndex {
	[key: string]: PlainSchema | SchemaEntry | SchemaEntry[];
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
export type SchemaPropertyType =
	| Constructor
	| PlainSchema
	| Schematic<unknown>
	| ValueName
	| ((value: unknown) => boolean);
