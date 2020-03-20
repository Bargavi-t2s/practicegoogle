const express= require('express');
var bodyParser = require('body-parser')
var app = express();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const url = require('url');

import {
  aboutPage,
  insertUserData,
  renderLandingPage,
  validateOwnDomain,
  validateCookie,
  validateUser,
  checkUser,
  signUp,
  signUpValidation, 
  sessionLogout,
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
let useremail="";
let created_by="";
  app.get('/', checkUser);

  app.get('/google', (req, res) => {
        const url = oAuth2Client.generateAuthUrl({
            
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        //console.log(url)
        res.redirect(url);
  });

  app.get('/oauth2callback',async(req,res)=>{
   
    if (req.url.indexOf('/oauth2callback') > -1) {
      const qs = new url.URL(req.url, 'http://localhost:8080')
        .searchParams;
      const code = qs.get('code');
      const scope = qs.get('scope');
      // console.log(code);
      // console.log(scope);


      const r = await oAuth2Client.getToken(code);
      //console.log(r);
            oAuth2Client.setCredentials(r.tokens);        
            
            var google = require('googleapis').google;
            var OAuth2 = google.auth.OAuth2;
            var oauth2Client = new OAuth2();
            oauth2Client.setCredentials({access_token: r.tokens.access_token});
            var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
            });
            oauth2.userinfo.get(
            function(err, res) {
                if (err) {
                console.log(err);
                } else {
                 // console.log(res);
                  console.log(res.data);
                  useremail+=res.data.name;
                  created_by+=res.data.name;
                //console.log(res.data.id,res.data.name);
                }
            });
    }   

      res.redirect("/welcome");
          // res.render('index',{
          //   useremail:useremail,
          //   created_by:useremail
          // });

  });

  app.get('/welcome',(req,res)=>
  { //res.send("authentication done")
    res.redirect("/generateUrl");
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

app.post("/generateUrl", validateUser, renderLandingPage);

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

  app.post("/login", signUpValidation, insertUserData);

  app.get("/login-session-expired", sessionLogout);

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

