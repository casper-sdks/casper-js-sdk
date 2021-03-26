import { concat } from '@ethersproject/bytes';
import { Result, Ok, Err} from "ts-results";

import { CLValue, CLType, ToBytes } from './index';
import { toBytesU8 } from '../ByteConverters';

export enum CLErrorCodes {
  EarlyEndOfStream = 0,
  Formatting,
  LeftOverBytes,
  OutOfMemory
}

const RESULT_TAG_ERROR = 1;
const RESULT_TAG_OK = 1;

export class CLResultType extends CLType {
  toString(): string {
    return 'Result';
  }
}

export class GenericResult<T, E> {
  constructor(public data: Result<T, E>) {}

  /**
   * Returns Result from ts-result based on stored value
   */
  value(): Result<T, E> {
    return this.data;
  }
}

/**
 * Class representing a result of an operation that might have failed. Can contain either a value
 * resulting from a successful completion of a calculation, or an error. Similar to `Result` in Rust
 * or `Either` in Haskell.
 */
export class CLResult extends GenericResult<CLValue & ToBytes, CLErrorCodes> implements CLValue, ToBytes {
  clType(): CLType {
    return new CLResultType();
  }

  toBytes(): Uint8Array {
     if (this.data instanceof Ok && this.data.val instanceof CLValue) {
       return concat([Uint8Array.from([RESULT_TAG_OK]), this.data.val.toBytes()]);
     } else if (this.data instanceof Err && this.data.val instanceof Uint8Array) {
       return concat([Uint8Array.from([RESULT_TAG_ERROR]), toBytesU8(this.data.val)]);
     } else {
       throw new Error('Unproper data stored in CLResult');
     }
   }
}
