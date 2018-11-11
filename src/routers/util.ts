
export type Validation = {
  [param: string]: string | string[]
};

export function validateBody(
  object: any, validation: Validation, atLeast: number = undefined) {
  if ('body' in object) {
    object = { ...object.body };
  }
  return validateParams(object, validation, atLeast);
}



export function validateParams(
  object: any, validation: Validation, atLeast: number = undefined): any |
  null {
  let params = {};

  if ('params' in object) {
    object = { ...object.params };
  }

  // no object found
  if (!object) {
    return null;
  }


  // for every params to validate
  for (const p of Object.keys(validation)) {
    // convert to an array if needed to enter the loop
    if (!(validation[p] instanceof Array)) {
      validation[p] = [<string>validation[p]];
    }

    // if the param is not in the object, returns false directly
    if (object[p] === undefined && !validation[p].includes('undefined')) {
      return null;
    }
    if (object[p] === undefined && validation[p].includes('undefined')) {
      continue;
    }

    let valid = false;

    // for every type
    for (const t of validation[p]) {
      // if valid we pass all other validation
      if (valid)
        continue;

      let typeDetails: any = { type: t };

      // details the string type ?
      if (typeDetails.type !== 'string') {
        let stringDetails;
        if ((stringDetails = typeDetails.type.match(/^string\((.*)\)$/))) {
          typeDetails.type = 'string';
          typeDetails.length = parseInt(stringDetails[1]);  // add the length
        }
      }
      // todo: more details (for example size of integer)


      switch (typeDetails.type) {
        case 'number':
        case 'integer':
          valid = (typeof object[p] === 'number');
          if (valid) {
            params[p] = object[p];
            break;
          }
          // against the string
          valid = (parseInt(object[p]).toString() === object[p]);
          if (valid) {
            params[p] = parseInt(object[p]);
            break;
          }
          break;
        case 'float':
          // is the string representing a float number ?
          valid = (parseFloat(object[p]).toString() === object[p]);
          if (valid) {
            params[p] = parseFloat(object[p]);
          }
          break;
        case 'boolean':
          valid = (typeof object[p] === 'boolean');
          if (valid) {
            params[p] = object[p];
            break;
          }
          // against the string
          valid =
            (object[p] &&
              (object[p].toLowerCase() === 'true' ||
                object[p].toLowerCase() === 'false'));
          if (valid) {
            params[p] = object[p].toLowerCase();
            break;
          }
          break;
        case 'string':
          valid = (typeof object[p] === 'string');
          if (valid && typeDetails.length) {
            valid = (object[p].length === typeDetails.length);
          }
          if (valid) {
            params[p] = object[p];
            break;
          }
          break;
        case 'null':
          valid = (object[p] === null);
          if (!valid) {  // try against the string
            valid = (object[p] === 'null');
          }
          if (valid) {
            params[p] = null;
          }
          break;
        case 'undefined':
          valid = (object[p] === undefined);
          break;
      }
    }

    // if no validation type were satisfied (fail)
    if (!valid)
      return null;
  }

  if (atLeast) {
    if (Object.keys(params).length < atLeast) {
      return null;
    }
  }

  return params;
}



export interface ErrorDetails {
  message?: string;
  /** Usually error code from database */
  errcode?: number;
  /** Recommended http status to send as a response */
  httpStatus?: number;
}

export function getErrorDetails(
  error: any, customErrorMessages: { [code: string]: string } = {}) {
  let details: ErrorDetails = {
    message: 'none',
    httpStatus: 200
  }

  // objection validation fail
  if (error.name === 'ValidationError') {
    details.message = `Bad Arguments (${error.message})`;
    details.errcode = error.statusCode;
    details.httpStatus = 400;
  }

  // probably errors from the database
  if (error.code) {
    details.errcode = error.code;

    switch (error.code) {
      case '42703':
        details.message = customErrorMessages['42703'] || 'Too many arguments';
        details.httpStatus = 400;
        break;
      case '23505':
        details.message =
          customErrorMessages['23505'] || 'The object already exist.';
        break;
      case '23502':
        details.message = customErrorMessages['23502'] ||
          'Trying to delete but some data depends on it.';
        break;
      default:
        details.message = customErrorMessages[error.code] || null;
        details.httpStatus = 500;
    }
  }

  return details;
}
