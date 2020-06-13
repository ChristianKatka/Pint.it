import { TnsOAuthClient, ITnsOAuthTokenResult } from 'nativescript-oauth2';


/**
 * DOES A SOCIAL LOGIN TO SPECIFIC PLATFORM
 * 
 * Function which'll use OAuth2-library to do a social login to specific 
 * platform. If login is successful, ITnsOAuthTokenResult-token will be 
 * returned to the caller. Error will be called instead if social login
 * fails.
 * 
 * @param {string} providerType Social provider one tries to social login to
 * @example "Google / Facebook"
 *  
 */
export function tnsOauthLogin(providerType: string): Promise<ITnsOAuthTokenResult> {
  
  const client = new TnsOAuthClient(providerType);
  
  return new Promise<ITnsOAuthTokenResult>((resolve, reject) => {
    client.loginWithCompletion(
      (tokenResult: ITnsOAuthTokenResult, error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(tokenResult);
        }
      }
    );
  });
}