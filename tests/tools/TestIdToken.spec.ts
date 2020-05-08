import ToolHelpers from "./ToolHelpers";
import { IdTokenValidation, TokenType } from "../../lib";

describe('tools - test id token', () => {
  it('should validate an id token', async () => {
    return;
    const idToken = 'put your id token here';

    const expected = { 
      type: TokenType.idToken, 
      issuers: ['https://login.microsoftonline.com/woodgrove.ms/.well-known/openid-configuration']
    };
    const options = ToolHelpers.getOptions();
    const validator = new IdTokenValidation(options, expected);
    const response = await validator.validate(idToken);
    expect(response.result).toBeTruthy();
  });
});