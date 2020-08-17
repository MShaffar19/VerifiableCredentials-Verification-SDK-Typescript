/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IRequestorPresentationExchange, PresentationDefinitionModel, PresentationExchangeInputDescriptorModel, PresentationExchangeIssuanceModel, PresentationExchangeSchemaModel, RequestorBuilder, CryptoBuilder, KeyReference, KeyUse, LongFormDid } from '../lib/index';
import TokenGenerator from './TokenGenerator';

export default class RequestorHelper {

    /**
     * the name of the requestor (Relying Party)
     */
    public clientName = 'My relying party';

    /**
     * The audience of the requestor
     */
    public audience = 'https://relyingparty.example.com';

    /**
     * explaining the purpose of sending claims to relying party
     */
    public clientPurpose = 'Need your VC to provide access';

    /**
     *  the url where the request came from
     */
    public clientId = 'https://requestor.example.com';

    /**
     *  url to send response to
     */
    public redirectUri = 'https://response.example.com';

    /**
     * url pointing to terms and service user can open in a webview
     */
    public tosUri = 'https://tosUri.example.com';

    /**
     * url pointing to logo of the requestor (Relying Party)
     */
    public logoUri = 'https://logoUri.example.com';

    public userDid = 'did:user';

    public manifest = 'https://portableidentitycards.azure-api.net/dev-v1.0/536279f6-15cc-45f2-be2d-61e352b51eef/portableIdentities/contracts/IdentityCard1';

    public inputDescriptorId = 'IdentityCard';
    public issuance = [new PresentationExchangeIssuanceModel(this.manifest)];

    // Schema props
    public schemaUri = 'https://schema.org/IdentityCardCredential';
    public schemaName = 'IdentityCard';
    public schemaPurpose = 'Testing the site';
    public schema = new PresentationExchangeSchemaModel([this.schemaUri], this.schemaName, this.schemaPurpose);

    // presentation definition
    public presentationDefinitionName = 'Get driving license';
    public presentationDefinitionPurpose = 'Needed to provide you access to the site';

    public presentationDefinition = new PresentationDefinitionModel(
        [new PresentationExchangeInputDescriptorModel(
            this.inputDescriptorId,
            this.schema,
            this.issuance)],
        this.presentationDefinitionName,
        this.presentationDefinitionPurpose);

    public presentationExchangeModel = {
        presentation_definition: {
            name: this.presentationDefinitionName,
            purpose: this.presentationDefinitionPurpose,
            input_descriptors: [
                {
                    id: this.inputDescriptorId,
                    schema: {
                        uri: this.schemaUri,
                        name: this.schemaName,
                        purpose: this.schemaPurpose
                    },
                    issuance: [
                        {
                          did: this.userDid, 
                          manifest: this.manifest 
                        }
                    ]
                }
            ]
        }

    }
    /**
     * Define the presentation exchange requestor
     */
    public presentationExchangeRequestor: IRequestorPresentationExchange = {

        /**
         * the name of the requestor (Relying Party)
         */
        clientName: this.clientName,

        /**
         * explaining the purpose of sending claims to relying party
         */
        clientPurpose: this.clientPurpose,

        /**
         *  the url where the request came from
         */
        clientId: this.clientId,

        /**
         *  url to send response to
         */
        redirectUri: this.redirectUri,

        /**
         * url pointing to terms and service user can open in a webview
         */
        tosUri: this.tosUri,

        /**
         * url pointing to logo of the requestor (Relying Party)
         */
        logoUri: this.logoUri,

        /**
         * The presentation definition
         */
        presentationDefinition: this.presentationDefinition
    };

    public crypto = new CryptoBuilder()
        .useSigningKeyReference(new KeyReference('signing'))
        .useRecoveryKeyReference(new KeyReference('recovery'))
        .build();

    /**
     * Requestor and builder builder
     */
    public builder = new RequestorBuilder(this.presentationExchangeRequestor, this.crypto)
        .useOidcRequestExpiry(7*3600*24);
    public requestor = this.builder.build();

    public async setup(): Promise<void> {
        this.crypto = await this.crypto.generateKey(KeyUse.Signature, 'signing');
        this.crypto = await this.crypto.generateKey(KeyUse.Signature, 'recovery');
        let did = await new LongFormDid(this.crypto).serialize();
        this.crypto.builder.useDid(did);

        // setup mock to resolve this did
        TokenGenerator.mockResolver(this.crypto);
    }
}
