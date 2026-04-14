import type {ValidationHandler, PropertyValidation} from '../models/validation.model';

export function getBaseHandler(handlers: ValidationHandler[]): ValidationHandler {
	const {length} = handlers;

	return (input, parameters, get) => {
		const allInformation: PropertyValidation[] = [];

		for (let index = 0; index < length; index += 1) {
			const previousInformation = parameters.information;

			const nextInformation: PropertyValidation[] = [];

			parameters.information = nextInformation;

			const result = handlers[index](input, parameters, get);

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
