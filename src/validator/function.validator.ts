import {isConstructor} from '@oscarpalmer/atoms/is';
import {instanceOf} from '../helpers/misc.helper';
import type {Validator} from '../models/validation.model';

export function getFunctionValidator(fn: Function): Validator {
	const validator = isConstructor(fn) ? instanceOf(fn) : fn;

	return input => validator(input) === true;
}
