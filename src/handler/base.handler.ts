import type {PropertyValidation, ValidationHandler} from '../models/validation.model';

// #region Functions

export function getBaseHandler(handlers: ValidationHandler[]): ValidationHandler {
	const {length} = handlers;

	return (input, parameters, get) => {
		const allInformation: PropertyValidation[] = [];

		for (let index = 0; index < length; index += 1) {
			let previousInformation: PropertyValidation[] | undefined;

			if (!parameters.reporting.none) {
				previousInformation = parameters.information;

				const nextInformation: PropertyValidation[] = [];

				parameters.information = nextInformation;
			}

			const result = handlers[index](input, parameters, get);

			if (previousInformation != null) {
				parameters.information = previousInformation;
			}

			if (result === true) {
				return true;
			}

			if (parameters.reporting.none) {
				continue;
			}

			parameters.information?.push(...result);

			allInformation.push(...result);
		}

		return allInformation;
	};
}

// #endregion
