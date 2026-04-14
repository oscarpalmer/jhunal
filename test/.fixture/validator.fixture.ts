import {GenericCallback} from '@oscarpalmer/atoms';
import {error, ok} from '@oscarpalmer/atoms/result/misc';
import {Err} from '@oscarpalmer/atoms/result/models';
import {schema, validator} from '../../src';
import {
	TEMPLATE_PATTERN,
	VALIDATION_MESSAGE_INVALID_PROPERTY_TYPE,
	VALIDATION_MESSAGE_INVALID_VALIDATOR_SUFFIX,
	VALIDATION_MESSAGE_INVALID_VALUE_TYPE,
	VALIDATION_MESSAGE_INVALID_VALUE_VALIDATOR,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_NULLABLE,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_TYPE,
} from '../../src/constants';
import {ValueValidation} from '../../src/models/validation.model';

function getFakeError(
	value: unknown,
	message: string,
	validator: GenericCallback,
): Err<ValueValidation> {
	return error({message, validator, value});
}

function getFakeInvalidTypeMessage(type: string, actual: string): string {
	return VALIDATION_MESSAGE_INVALID_VALUE_TYPE.replace(TEMPLATE_PATTERN, type).replace(
		TEMPLATE_PATTERN,
		actual,
	);
}

function getFakeInvalidTypeMessageForKey(key: string, type: string, actual: string): string {
	return VALIDATION_MESSAGE_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, type)
		.replace(TEMPLATE_PATTERN, key)
		.replace(TEMPLATE_PATTERN, actual);
}

function getFakeValidatorMessage(type: string, index: number, length: number): string {
	let message = VALIDATION_MESSAGE_INVALID_VALUE_VALIDATOR.replace(TEMPLATE_PATTERN, type);

	if (length > 1) {
		message += VALIDATION_MESSAGE_INVALID_VALIDATOR_SUFFIX.replace(TEMPLATE_PATTERN, String(index));
	}

	return message;
}

const firstErrorCases = [
	null,
	undefined,
	false,
	123,
	123n,
	'hello, world',
	Symbol('foo'),
	() => {},
	new Date(),
	[1, 2, 3],
	{foo: 'bar'},
];

const firstErrorTypes = [
	'null',
	'undefined',
	'a boolean',
	'a number',
	'a bigint',
	'a string',
	'a symbol',
	'a function',
	'Date',
	'an array',
	'an object',
];

const firstErrorMessages = firstErrorCases.map((value, index) =>
	getFakeInvalidTypeMessage(
		typeof value === 'string' ? 'a number' : 'a string',
		firstErrorTypes[index],
	),
);

const firstErrorValidators = firstErrorCases.map(value =>
	validator(typeof value === 'string' ? 'number' : 'string'),
);

export const firstError = {
	cases: firstErrorCases,
	length: firstErrorCases.length,
	messages: firstErrorMessages,
	validators: firstErrorValidators,
};

const invalidCases = [null, undefined, {}, new Map(), schema({test: 'string'})];

const invalidMessages = [
	VALIDATOR_MESSAGE_INVALID_PROPERTY_NULLABLE,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_NULLABLE,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_TYPE,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_TYPE,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_TYPE,
];

export const invalid = {
	cases: invalidCases,
	length: invalidCases.length,
	messages: invalidMessages,
};

const schematicInstance = schema({
	validated: validator('number'),
});

const schematicMessage = getFakeInvalidTypeMessageForKey('validated', 'a number', 'a string');

export const schematic = {
	instance: schematicInstance,
	message: schematicMessage,
};

const simpleCases = [
	'array',
	'bigint',
	'boolean',
	'date',
	'function',
	'null',
	'number',
	'object',
	'string',
	'symbol',
	'undefined',
	['date', 'number'],
];

const simpleValues = [
	[1, 2, 3],
	123n,
	true,
	new Date(),
	() => {},
	null,
	123,
	{foo: 'bar'},
	'hello, world',
	Symbol('foo'),
	undefined,
	123,
];

export const simple = {
	cases: simpleCases,
	length: simpleCases.length,
	values: simpleValues,
};

const validatorsCases = [-100, -50, 0, 50, 100];

const validatorsFunctions = [(value: number) => value > 0, (value: number) => value < 100];

const validatorsInstances = [
	validator('number'),
	validator('number', validatorsFunctions[0]),
	validator('number', [validatorsFunctions[0], validatorsFunctions[1]]),
	validator('number', {
		number: validatorsFunctions[0],
	}),
	validator('number', {
		number: [validatorsFunctions[0], validatorsFunctions[1]],
	}),
];

const validatorsBooleans = [
	[true, false, false, false, false],
	[true, false, false, false, false],
	[true, false, false, false, false],
	[true, true, true, true, true],
	[true, true, false, true, false],
];

const validatorsMessages = [
	getFakeValidatorMessage('number', 0, 1),
	getFakeValidatorMessage('number', 0, 2),
];

const validatorsOk = ok(true);

const validatorResults = [
	[
		validatorsOk,
		...validatorsMessages.map(message => getFakeError(-100, message, validatorsFunctions[0])),
		...validatorsMessages.map(message => getFakeError(-100, message, validatorsFunctions[0])),
	],
	[
		validatorsOk,
		...validatorsMessages.map(message => getFakeError(-50, message, validatorsFunctions[0])),
		...validatorsMessages.map(message => getFakeError(-50, message, validatorsFunctions[0])),
	],
	[
		validatorsOk,
		...validatorsMessages.map(message => getFakeError(0, message, validatorsFunctions[0])),
		...validatorsMessages.map(message => getFakeError(0, message, validatorsFunctions[0])),
	],
	[validatorsOk, validatorsOk, validatorsOk, validatorsOk, validatorsOk],
	[
		validatorsOk,
		validatorsOk,
		getFakeError(100, getFakeValidatorMessage('number', 1, 2), validatorsFunctions[1]),
		validatorsOk,
		getFakeError(100, getFakeValidatorMessage('number', 1, 2), validatorsFunctions[1]),
	],
];

export const validators = {
	booleans: validatorsBooleans,
	cases: validatorsCases,
	instances: validatorsInstances,
	length: validatorsInstances.length,
	results: validatorResults,
};
