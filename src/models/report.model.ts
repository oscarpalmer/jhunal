import type {GenericCallback} from '@oscarpalmer/atoms/models';
import type {PropertyValidationKey, ValidationHandlerParameters} from './validation.model';

// #region Types

export type ReportData = {
	key?: PropertyValidationKey;
	message: ReportDataMessage;
	validator?: GenericCallback;
	value: unknown;
};

type ReportDataMessage = {
	callback: GenericCallback;
	parameters: unknown[];
};

export type ReportParameters<Callback extends (...args: any[]) => string> = {
	data?: ReportParametersData;
	extract?: boolean;
	key?: PropertyValidationKey;
	message: ReportParametersMessage<Callback>;
	original: ValidationHandlerParameters;
	value: unknown;
};

export type ReportParametersMessage<Callback extends (...args: any[]) => string> = {
	callback: Callback;
	parameters: Parameters<Callback>;
};

export type ReportParametersData = {
	all: ReportData[];
	existing?: ReportData[];
};

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
