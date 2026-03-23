import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {ERROR_NAME} from '../constants';
import type {Schematic} from '../schematic';
import type {ExtractValueNames, ValueName, Values} from './misc.model';

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
export type PropertyValidators<Value> = {
	[Key in ExtractValueNames<Value>]?:
		| ((value: Values[Key]) => boolean)
		| Array<(value: Values[Key]) => boolean>;
};

/**
 * A custom error class for schematic validation failures
 */
export class SchematicError extends Error {
	constructor(message: string) {
		super(message);

		this.name = ERROR_NAME;
	}
}

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
