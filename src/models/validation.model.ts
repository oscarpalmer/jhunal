import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {NAME_ERROR_SCHEMATIC, NAME_ERROR_VALIDATION} from '../constants';
import type {Schematic} from '../schematic';
import type {ValueName} from './misc.model';

// #region Reporting

/**
 * Maps each {@link ReportingType} to a boolean flag
 */
export type ReportingInformation = Record<ReportingType, boolean> & {
	type: ReportingType;
};

/**
 * Controls how validation failures are reported
 *
 * - `'none'` — returns a boolean _(default)_
 * - `'first'` — returns the first failure as a `Result`
 * - `'all'` — returns all failures as a `Result` _(from same level)_
 * - `'throw'` — throws a {@link ValidationError} on failure
 */
export type ReportingType = 'all' | 'first' | 'none' | 'throw';

// #endregion

// #region Schematic validation

/**
 * Thrown when a schema definition is invalid
 */
export class SchematicError extends Error {
	constructor(message: string) {
		super(message);

		this.name = NAME_ERROR_SCHEMATIC;
	}
}

// #endregion

// #region Validated property

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
	| ValidatedProperty[]
	| Schematic<unknown>
	| ValueName;

/**
 * A map of validator functions keyed by {@link ValueName}, used at runtime in {@link ValidatedProperty}
 *
 * Each key holds an array of validator functions that receive an `unknown` value and return a `boolean`
 */
export type ValidatedPropertyValidators = {
	[Key in ValueName]?: Array<(value: unknown) => boolean>;
};

// #endregion

// #region Property validation

/**
 * Thrown in `'throw'` mode when one or more properties fail validation; `information` holds all failures
 */
export class ValidationError extends Error {
	constructor(readonly information: ValidationInformation[]) {
		super(
			join(
				information.map(item => item.message),
				'; ',
			),
		);

		this.name = NAME_ERROR_VALIDATION;
	}
}

/**
 * Describes a single validation failure
 */
export type ValidationInformation = {
	/** The key path of the property that failed */
	key: ValidationInformationKey;
	/** Human-readable description of the failure */
	message: string;
	/** The validator function that failed, if the failure was from a `$validators` entry */
	validator?: GenericCallback;
	/** The value that was provided */
	value: unknown;
};

/**
 * 
 */
export type ValidationInformationKey = {
	full: string;
	short: string;
};

/**
 * Options for validation
 */
export type ValidationOptions<Errors extends ReportingType> = {
	/**
	 * How should validation failures be reported; see {@link ReportingType} _(defaults to `'none'`)_
	 */
	errors?: Errors;
	/**
	 * Validate if unknown keys are present in the object? _(defaults to `false`)_
	 */
	strict?: boolean;
};

export type ValidationParameters = {
	information?: ValidationInformation[];
	origin?: ValidatedProperty;
	output: PlainObject;
	prefix?: string;
	reporting: ReportingInformation;
	strict: boolean;
};

// #endregion
