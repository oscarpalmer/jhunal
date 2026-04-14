import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {NAME_ERROR_SCHEMATIC, NAME_ERROR_VALIDATION, NAME_ERROR_VALIDATOR} from '../constants';
import type {Schema} from '../schema';
import type {Validator} from '../validator';
import type {ValueType} from './misc.model';

// #region Reporting

export type ReportingInformation = Record<ReportingType, boolean> & {
	type: ReportingType;
};

/**
 * Controls how validation failures are reported
 *
 * - `'none'`, returns a boolean _(default)_
 * - `'first'` or `'result'`, returns the first failure as a `Result`
 * - `'all'`, returns all failures as a `Result` _(from same level)_
 * - `'throw'`, throws a {@link ValidationError} on failure
 */
export type ReportingType = 'all' | 'first' | 'none' | 'result' | 'throw';

// #endregion

// #region Errors

/**
 * Thrown when a schema definition is invalid
 */
export class SchematicError extends Error {
	constructor(message: string) {
		super(message);

		this.name = NAME_ERROR_SCHEMATIC;
	}
}

/**
 * Thrown in `'throw'` mode when one or more properties fail validation; `information` holds all failures
 */
export class ValidationError extends Error {
	constructor(readonly information: PropertyValidation[]) {
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
 * Thrown when a validator definition is invalid
 */
export class ValidatorError extends Error {
	constructor(message: string) {
		super(message);

		this.name = NAME_ERROR_VALIDATOR;
	}
}

// #endregion

// #region Results

/**
 * Describes a single property validation failure
 */
export type PropertyValidation = {
	/**
	 * The key path of the property that failed
	 */
	key?: PropertyValidationKey;
	/**
	 * Human-readable description of the failure
	 */
	message: string;
	/**
	 * The validator function that failed, if the failure was from a `$validators` entry
	 */
	validator?: GenericCallback;
	/**
	 * The value that was provided
	 */
	value: unknown;
};

/**
 * The full and short key paths of a property; `full` is the complete path from the root, while `short` is the path from the current schema
 */
export type PropertyValidationKey = {
	full: string;
	short: string;
};

export type ValueValidation = {
	message: string;
	validator?: GenericCallback;
	value: unknown;
};

// #endregion

// #region Options

type BaseOptions<Errors extends ReportingType> = {
	/**
	 * How should validation failures be reported; see {@link ReportingType} _(defaults to `'none'`)_
	 */
	errors: Errors;
	/**
	 * Validate if unknown keys are present in the object? _(defaults to `false`)_
	 */
	strict?: boolean;
};

/**
 * Options for validating and getting a value from an input
 */
export type GetOptions<Errors extends ReportingType> = BaseOptions<Errors> & {
	/**
	 * Get a deeply cloned version of the input? _(defaults to `true`)_
	 */
	clone?: boolean;
};

/**
 * Options for validation an input value
 */
export type IsOptions<Errors extends ReportingType> = BaseOptions<Errors>;

// #endregion

// #region Type validation

/**
 * Object property validators
 */
export type Validators = {
	[Key in ValueType]?: Array<(value: unknown) => boolean>;
};

/**
 * Base type validators
 */
export type TypeValidators = Record<ValueType, (value: unknown) => boolean>;

// #endregion

// #region Validation handler

export type ValidationHandler = (
	input: unknown,
	parameters: ValidationHandlerParameters,
	get: boolean,
) => true | PropertyValidation[];

export type ValidationHandlerDefaults = {
	value: unknown;
};

export type ValidationHandlerItem = {
	defaults?: ValidationHandlerDefaults;
	handler: ValidationHandler;
	key: PropertyValidationKey;
	required: boolean;
	types: ValidationHandlerType[];
};

export type ValidationHandlerParameters = {
	clone: boolean;
	information?: PropertyValidation[];
	key?: string;
	output: PlainObject;
	reporting: ReportingInformation;
	strict: boolean;
};

export type ValidationHandlerType =
	| Function
	| PlainObject
	| Schema<unknown>
	| Validator<unknown>
	| ValueType;

// #endregion
