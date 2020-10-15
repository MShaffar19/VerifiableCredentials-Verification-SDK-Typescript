/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IValidationOptions } from '../options/IValidationOptions';
import { IVerifiableCredentialValidation, VerifiableCredentialValidationResponse } from './VerifiableCredentialValidationResponse';
import { DidValidation } from './DidValidation';
import { IExpectedVerifiableCredential, ClaimToken } from '../index';
import VerifiableCredentialConstants from '../verifiable_credential/VerifiableCredentialConstants';
import { isContext } from 'vm';

/**
 * Class for verifiable credential validation
 */
export class VerifiableCredentialValidationJsonLd implements IVerifiableCredentialValidation {

  /**
   * Create a new instance of @see <VerifiableCredentialValidation>
   * @param options Options to steer the validation process
   * @param expected Expected properties of the verifiable credential
   */
  constructor(private options: IValidationOptions, private expected: IExpectedVerifiableCredential) {
  }

  /**
   * Validate the verifiable credential
   * @param verifiableCredential The credential to validate as a signed token
   * @param siopDid needs to be equal to audience of VC
   * @returns result is true if validation passes
   */
  public async validate(_verifiableCredential: object, _siopDid: string): Promise<VerifiableCredentialValidationResponse> {
    let validationResponse: VerifiableCredentialValidationResponse = {
      result: true,
      status: 200
    };
    /*
    // Check the DID parts of the VC
    const didValidation = new DidValidation(this.options, this.expected);
    validationResponse = await didValidation.validate(verifiableCredential);
    if (!validationResponse.result) {
      return validationResponse;
    }

    // Get issuer from verifiable credential payload
    validationResponse.did = validationResponse.payloadObject.iss;

    if (!validationResponse.payloadObject.vc) {
      return {
        result: false,
        detailedError: `The verifiable credential does not has the vc property`,
        status: 403
      };
    }

    const context: string[] = validationResponse.payloadObject.vc[VerifiableCredentialConstants.CLAIM_CONTEXT];
    if (!context || context.length === 0) {
      return {
        result: false,
        detailedError: `The verifiable credential vc property does not contain ${VerifiableCredentialConstants.CLAIM_CONTEXT}`,
        status: 403
      };
    }

    if (context[0] !== VerifiableCredentialConstants.DEFAULT_VERIFIABLECREDENTIAL_CONTEXT) {
      return {
        result: false,
        detailedError: `The verifiable credential context first element should be ${VerifiableCredentialConstants.DEFAULT_VERIFIABLECREDENTIAL_CONTEXT}`,
        status: 403
      };
    }

    // Get credential type from context
    let credentialType: string;
    try {
      credentialType = VerifiableCredentialValidation.getVerifiableCredentialType(validationResponse.payloadObject.vc);
    } catch (exception) {
      console.error(exception.message);
      return {
        result: false,
        detailedError: exception.message,
        status: 403
      };
    }

    // Check token scope (aud and iss)
    validationResponse = await this.options.checkScopeValidityOnVcTokenDelegate(validationResponse, this.expected, siopDid);
    if (!validationResponse.result) {
      return validationResponse;
    }

    // Check if the VC matches the contract and its issuers
    // Get the contract from the VC
    if (this.expected.contractIssuers) {
      const contractIssuers = VerifiableCredentialValidation.getIssuersFromExpected(this.expected, credentialType);
      if (!(contractIssuers instanceof Array)) {
        // Error in issuers
        return <VerifiableCredentialValidationResponse>contractIssuers;
      }
      
      // Check if the we found a matching contract.
      if (!contractIssuers) {
        return {
          result: false,
          detailedError: `The verifiable credential with type '${credentialType}' is not expected in '${JSON.stringify(this.expected.contractIssuers)}'`,
          status: 403
        };
      }

      if (!contractIssuers.includes(validationResponse.payloadObject.iss)) {
        return {
          result: false,
          detailedError: `The verifiable credential with type '${credentialType}' is not from a trusted issuer '${JSON.stringify(this.expected.contractIssuers)}'`,
          status: 403
        };
      }
    }
    validationResponse.validationResult = { verifiableCredentials: <any>ClaimToken.create(verifiableCredential, credentialType) };
    */
    return validationResponse;
  }

  /**
   * Get the type from the payload of the verifiable credential
   * @param vc The payload of the verifiable credential
   */
  public static getVerifiableCredentialType(vc: any): string {

    const types: string[] = vc.type;
    if (!types || types.length === 0) {
      throw new Error(`The vc property does not contain type`);
    }

    if (types.length < 2) {
      throw new Error(`The verifiable credential type property should have two elements`);
    }

    if (types[0] !== VerifiableCredentialConstants.DEFAULT_VERIFIABLECREDENTIAL_TYPE) {
      throw new Error(`The verifiable credential type first element should be ${VerifiableCredentialConstants.DEFAULT_VERIFIABLECREDENTIAL_TYPE}`);
    }

    // Get credential type from context
    return types[1];
  }

  /**
   * Return expected issuers for verifyable credentials
   * @param expected Could be a contract based object or just an array with expected issuers
   * @param credentialType The credential types to which issuers are linked
   */
  public static getIssuersFromExpected(expected: IExpectedVerifiableCredential, credentialType?: string): string[] | VerifiableCredentialValidationResponse {
    if (!expected.contractIssuers) {
      return {
        result: false,
        status: 500,
        detailedError: `Expected should have contractIssuers set for verifyableCredential`
      };
    }

    let issuers: string[];

    // Expected can provide a list of contractIssuers or a list linked to a contract
    if (expected.contractIssuers instanceof Array) {
      if (expected.contractIssuers.length === 0) {
        return {
          result: false,
          status: 500,
          detailedError: `Expected should have contractIssuers set for verifiableCredential. Empty array presented.`
        };
      }
      issuers = <string[]>expected.contractIssuers;
    } else {
      if (!credentialType) {
        return {
          result: false,
          status: 500,
          detailedError: `The credentialType needs to be specified to validate the verifiableCredential.`
        };
      }

      // check for issuers for the contract
      if (!(<{ [contract: string]: string[] }>expected.contractIssuers)[credentialType]) {
        return {
          result: false,
          status: 403,
          detailedError: `Expected should have contractIssuers set for verifiableCredential. Missing contractIssuers for '${credentialType}'.`
        };
      }
      issuers = <string[]>expected.contractIssuers[credentialType]
    }
    return issuers;
  }
}
