import type {ReportData, ReportParameters} from '../models/report.model';
import {ValidationError} from '../models/validation.model';
import {generateValidationInformation} from './misc.helper';

// #region Functions

export function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
	getReports: true,
): ReportData[];

export function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
): ReportData[] | undefined;

export function report<Callback extends (...args: any[]) => string>(
	parameters: ReportParameters<Callback>,
	getReports?: boolean,
): ReportData[] | undefined {
	const {data, message, original} = parameters;

	let reported: ReportData[];

	if (data?.existing == null) {
		const report: ReportData = {
			message,
			value: parameters.value,
		};

		if (parameters.key != null) {
			report.key = parameters.key;
		}

		reported = [report];
	} else {
		reported = data.existing;
	}

	if (original.reporting.throw) {
		throw new ValidationError(generateValidationInformation(reported));
	}

	data?.all.push(...reported);

	if (parameters.extract ?? true) {
		original.reports?.push(...reported);
	}

	return (getReports ?? false) || !original.reporting.all ? reported : undefined;
}

// #endregion
