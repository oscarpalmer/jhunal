import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {NAME_ERROR_SCHEMATIC, NAME_ERROR_VALIDATION} from '../constants';
import type {Schema} from '../schema';
import type {ValueType} from './misc.model';

// #region Reporting

export type ReportingInformation = Record<ReportingType, boolean> & {
	type: ReportingType;
};

/**
 * Controls how validation failures are reported
 *
 * - `'none'`, returns a boolean _(default)_
 * - `'first'`, returns the first failure as a `Result`
 * - `'all'`, returns all failures as a `Result` _(from same level)_
 * - `'throw'`, throws a {@link ValidationError} on failure
 */
export type ReportingType = 'all' | 'first' | 'none' | 'throw';

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

// #endregion

// #region Results

/**
 * Describes a single validation failure
 */
export type ValidationInformation = {
	/** The key path of the property that failed */
	key?: ValidationInformationKey;
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
 * Object property validation handlers
 */
export type TypedHandlers = {
	[Key in ValueType]?: Array<(value: unknown) => boolean>;
};

/**
 * Base type validation handlers
 */
export type TypeHandlers = Record<ValueType, (value: unknown) => boolean>;

// #endregion

// #region Validation handler

export type ValidationHandler = (
	input: unknown,
	parameters: ValidationHandlerParameters,
	get: boolean,
) => true | ValidationInformation[];

export type ValidationHandlerDefaults = {
	value: unknown;
};

export type ValidationHandlerItem = {
	defaults: ValidationHandlerDefaults | undefined;
	key: ValidationInformationKey;
	required: boolean;
	types: ValidationHandlerType[];
	validator: ValidationHandler;
};

export type ValidationHandlerParameters = {
	clone: boolean;
	information?: ValidationInformation[];
	output: PlainObject;
	reporting: ReportingInformation;
	strict: boolean;
};

export type ValidationHandlerType = Function | PlainObject | Schema<unknown> | ValueType;

// #endregion
