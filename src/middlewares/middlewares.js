import { validateCookie } from './validateCookie';
import { renderLandingPage } from './renderLandingPage';
import{ aboutPage } from './aboutPage';
import{ insertUserData, validateUser, checkUser, signUp,signUpValidation, sessionLogout } from './signUp';
import { validateOwnDomain, urlAlreadyTrimmedByUser, stripUrl, customUrlExists } from './validateUrl';

export { renderLandingPage, aboutPage, validateOwnDomain, validateCookie, urlAlreadyTrimmedByUser, stripUrl, customUrlExists, insertUserData, checkUser, signUp,signUpValidation,validateUser, sessionLogout};
