import type {ValidationInformation, ValidationHandler} from '../models/validation.model';

export function getBaseHandler(validators: ValidationHandler[]): ValidationHandler {
	const {length} = validators;

	return (input, parameters, get) => {
		const allInformation: ValidationInformation[] = [];

		for (let index = 0; index < length; index += 1) {
			const previousInformation = parameters.information;

			const nextInformation: ValidationInformation[] = [];

			parameters.information = nextInformation;

			const result = validators[index](input, parameters, get);

			parameters.information = previousInformation;

			if (result === true) {
				return true;
			}

			parameters.information?.push(...result);

			allInformation.push(...result);
		}

		return allInformation;
	};
}
