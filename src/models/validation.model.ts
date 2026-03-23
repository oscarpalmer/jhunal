import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {NAME_ERROR_SCHEMATIC, NAME_ERROR_VALIDATION} from '../constants';
import type {Schematic} from '../schematic';
import type {ValueName} from './misc.model';

// #region Reporting

export type ReportingInformation = Record<ReportingType, boolean>;

export type ReportingType = 'all' | 'first' | 'none' | 'throw';

// #endregion

// #region Schematic validation

/**
 * A custom error class for schematic validation failures
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
	key: ValidatedPropertyKey;
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
 * Property name in schema
 */
export type ValidatedPropertyKey = {
	/**
	 * Full property key, including parent keys for nested properties _(e.g., `address.street`)_
	 */
	full: string;
	/**
	 * The last segment of the property key _(e.g., `street` for `address.street`)_
	 */
	short: string;
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

export type ValidationInformation = {
	key: ValidationInformationKey;
	message: string;
	validator?: GenericCallback;
};

export type ValidationInformationKey = ValidatedPropertyKey;

// #endregion
