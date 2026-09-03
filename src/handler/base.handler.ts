import type {ReportData} from '../models/report.model';
import type {ValidationHandler} from '../models/validation.model';

// #region Functions

export function getBaseHandler(handlers: ValidationHandler[]): ValidationHandler {
	const {length} = handlers;

	return (input, parameters, getValue) => {
		const allReports: ReportData[] = [];

		for (let index = 0; index < length; index += 1) {
			let previousReports: ReportData[] | undefined;

			if (!parameters.reporting.none) {
				previousReports = parameters.reports;

				const nextReports: ReportData[] = [];

				parameters.reports = nextReports;
			}

			const result = handlers[index](input, parameters, getValue);

			if (previousReports != null) {
				parameters.reports = previousReports;
			}

			if (result === true) {
				return true;
			}

			if (parameters.reporting.none) {
				continue;
			}

			parameters.reports?.push(...result);

			allReports.push(...result);
		}

		return allReports;
	};
}

// #endregion
