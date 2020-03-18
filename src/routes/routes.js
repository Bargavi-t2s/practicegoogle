const express= require('express');
var bodyParser = require('body-parser')
var app = express();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

import {
  aboutPage,
  renderLandingPage,
  validateOwnDomain,
  validateCookie,
  urlAlreadyTrimmedByUser,
  stripUrl,
  customUrlExists
} from "../middlewares/middlewares";
import {
  getRegistration,
  getJwtToken,
  getUrlAndUpdateCount,
  trimUrl,
  deleteUrl,
  redirectUrl
} from "../controllers/urlController";
import { getUrlClickMetrics } from '../controllers/metricsController';
const auth = require('../middlewares/auth')

export const initRoutes = app => {

const swaggerDefinition = {
    //openapi: '3.0.1', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Shortul API',
      version: '1.0.0,',
      description: 'shorturl API',
    },
    securityDefinitions: {
      jwt: {
          type: 'apiKey',
          'in': 'header',
          name: 'Authorization',
      },
},
security: [
      {
          jwt: [],
      },
],
    servers: [
      {
      url: `/`,
      description: `Testing endpoint`
      }
      ],    
  };

const { google } = require('googleapis');
const OAuth2Data = require('../short_url_google_key.json');

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;

  app.get('/login', (req,res,next)=>{
    res.render('login');

  });

  app.get('/', (req, res) => {
        const url = oAuth2Client.generateAuthUrl({
            
            scope: 'https://www.googleapis.com/auth/gmail.readonly'
        });
        console.log(url)
        res.redirect(url);
        console.log("This is index.")
  });



  const options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./src/routes/routes.js'],
  };
  
  const swaggerSpec = swaggerJSDoc(options);
  
  app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // app.use(bodyParser.json());
  // app.use(bodyParser.text()); 

  /**
* @swagger
*    /:
*   get:
*     summary: First page.
*     responses:
*       200:
*         description: Home page.
*       400:
*         description: Bad request.
*       404:
*         description: Page not found.
*       default:
*         description: Unexpected error
*/
app.get("/generateUrl", validateCookie, renderLandingPage);

app.post("/generateurl", validateUser);

app.get("/about", (req, res) => res.status(200).render("about"));

app.get("/signup", (req, res) => res.status(200).render("signup"));
/**
* @swagger
*    /:
*   post:
*     tags:
*       - Url
*     name: Url 
*     summary: ""
*     parameters:
*       - in: body
*         name: body
*         description: "Checking the given url is already present or not. \ninput: LongUrl.\noutput: Trimmed url or Exist status of the url "
*         required: true
*         schema:
*           $ref: "#/definitions/Url"
*     responses:
*       200:
*         description: url details.
*       401:
*         description: Bad request
*       403:
*         description: Unexpected errors
* definitions:
*   Url:
*     properties:
*       long_url:
*         type: "string"
*       expiry_date:
*         type: "string"
*       cutom_url:
*         type: "string"
*     xml:
*       name: "Url"
*/


  app.post("/", stripUrl, validateOwnDomain, urlAlreadyTrimmedByUser, customUrlExists, trimUrl);
  app.get("/about", aboutPage);

  app.post("/login", insertUserData);
  
  app.get("/:id", getUrlAndUpdateCount);

/**
* @swagger
* /getToken:
*   post:
*     security:
*       - jwt: []
*     tags:
*       - Users
*     name: getToken
*     summary: "Token generation"
*     parameters:
*       - in: body
*         name: body
*         description: "Generation of JwtToken \n input: EmailId, password \n ouput: Token"
*         required: true
*         schema:
*           $ref: "#/definitions/User"
*     responses:
*       200:
*         description: User found and logged in successfully
*       401:
*         description: Bad username, not found in db
*       403:
*         description: Username and password don't match
* definitions:
*   User:
*     properties:
*       email:
*         type: "string"
*       password:
*         type: "string"
*     xml:
*       name: "User"
*/

  app.post("/getToken",getJwtToken);

/**
* @swagger
* /register:
*   post:
*     tags:
*       - Users
*     name: getRegistration
*     summary: "User registration"
*     parameters:
*       - in: body
*         name: body
*         description: "Register with email and password \n  input: EmailId, password, name \n output: Registration status"
*         required: true
*         schema:
*           $ref: "#/definitions/Register"
*     responses:
*       200:
*         description: Registration done successfully
*       401:
*         description: Bad request
*       403:
*         description: Username and password don't match
* definitions:
*   Register:
*     properties:
*       email:
*         type: "string"
*       password:
*         type: "string"
*       name:
*         type: "string"
*     xml:
*       name: "Register"
*/


  app.post("/register", getRegistration);

/**
* @swagger
*  /getShortUrl:
*   post:
*     tags:
*       - Url
*     name: Url 
*     summary: "Generation of shorturl"
*     parameters:
*       - in: body
*         name: body
*         description: "Clipping of long url \n input: LongUrl \n output: Trimmed url or Exists status of the url"
*         required: true
*         schema:
*           $ref: "#/definitions/Url"
*     responses:
*       200:
*         description: url details.
*       401:
*         description: Bad request
*       403:
*         description: Unexpected errors
* definitions:
*   Url:
*     properties:
*       long_url:
*         type: "string"
*       expiry_date:
*         type: "string"
*       cutom_url:
*         type: "string"
*     xml:
*       name: "Url"
*/
  app.post("/getShortUrl",auth, stripUrl, customUrlExists, trimUrl);
  app.get('/metrics/:urlShortenId', getUrlClickMetrics);
  app.all("*", (req, res) => res.status(404).render("error"));

};

