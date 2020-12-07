/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDidResolver, Crypto } from '../index';
import ICorrelationId from '../tracing/ICorrelationId';

/**
 * Interface to model the fetch options
 */
export interface IHttpClientOptions {

    /**
     * The http client options
     */
    options: any,
}

 /**
 * Interface to model the validator options
 */
export default interface IValidatorOptions {

    /**
     * The DID resolver
     */
    resolver: IDidResolver,

    /**
     * The correlation vector
     */
    correlationId: ICorrelationId,

    /**
     * Get the crypto options
     */
    crypto: Crypto
}
