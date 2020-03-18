import { validateCookie } from './validateCookie';
import { renderLandingPage } from './renderLandingPage';
import{ aboutPage } from './aboutPage';
import{ insertUserData, validateUser } from './signUp';
import { validateOwnDomain, urlAlreadyTrimmedByUser, stripUrl, customUrlExists } from './validateUrl';

export { renderLandingPage, aboutPage, validateUser, validateOwnDomain, validateCookie, urlAlreadyTrimmedByUser, stripUrl, customUrlExists, insertUserData };
