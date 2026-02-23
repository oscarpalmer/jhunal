import type {Values} from './models';

export const EXPRESSION_HAS_NUMBER = /\d+/;

export const EXPRESSION_INDEX = /\.\d+$/;

export const EXPRESSION_PROPERTY = /\.\$(required|type|validators)(\.|$)/;

export const PROPERTY_REQUIRED = '$required';

export const PROPERTY_TYPE = '$type';

export const PROPERTY_VALIDATORS = '$validators';

export const SCHEMATIC_NAME = '$schematic';

export const TYPE_OBJECT = 'object';

export const TYPE_UNDEFINED = 'undefined';

export const TYPE_ALL = new Set<keyof Values>([
	'array',
	'bigint',
	'boolean',
	'date',
	'function',
	'null',
	'number',
	'string',
	'symbol',
	TYPE_OBJECT,
	TYPE_UNDEFINED,
]);
