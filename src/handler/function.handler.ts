import {isConstructor} from '@oscarpalmer/atoms/is';
import {instanceOf} from '../helpers/misc.helper';
import type {ValidationHandler} from '../models/validation.model';

export function getFunctionHandler(fn: Function): ValidationHandler {
	const validator = isConstructor(fn) ? instanceOf(fn) : fn;

	return input => (validator(input) ? true : []);
}
