import {
	ValidationError,
	type PropertyValidation,
	type PropertyValidationKey,
	type ValidationHandlerParameters,
} from '../models/validation.model';

// #region Types

type ReportParameters<Callback extends (...args: any[]) => string> = {
	extract?: boolean;
	information?: ReportParametersInformation;
	key?: PropertyValidationKey;
	message: ReportParametersMessage<Callback>;
	original: ValidationHandlerParameters;
	value: unknown;
};

type ReportParametersMessage<Callback extends (...args: any[]) => string> = {
	arguments: Parameters<Callback>;
	callback: Callback;
};

type ReportParametersInformation = {
	all: PropertyValidation[];
	existing?: PropertyValidation[];
};

// #endregion

// #region Functions

export function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
	getReports: true,
): PropertyValidation[];

export function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
): PropertyValidation[] | undefined;

export function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
	getReports?: boolean,
): PropertyValidation[] | undefined {
	const {information, message, original} = parameters;

	let reported: PropertyValidation[];

	if (information?.existing == null) {
		reported = [
			{
				value: parameters.value,
				message: message.callback(...message.arguments),
			},
		];

		if (parameters.key != null) {
			reported[0].key = parameters.key;
		}
	} else {
		reported = information.existing;
	}

	if (original.reporting.throw) {
		throw new ValidationError(reported);
	}

	information?.all.push(...reported);

	if (parameters.extract ?? true) {
		original.information?.push(...reported);
	}

	return (getReports ?? false) || !original.reporting.all ? reported : undefined;
}

// #endregion
