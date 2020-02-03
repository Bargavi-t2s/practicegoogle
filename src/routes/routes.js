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
  app.get("/", validateCookie, renderLandingPage);
  app.get("/about", (req, res) => res.status(200).render("about"));
  app.post("/", stripUrl, validateOwnDomain, urlAlreadyTrimmedByUser, customUrlExists, trimUrl);
  app.get("/about", aboutPage);

  app.get("/:id", getUrlAndUpdateCount);
  app.post("/getToken", getJwtToken);
  app.post("/register", getRegistration);
  app.post("/getShortUrl",auth, stripUrl, customUrlExists, trimUrl);

  app.get('/metrics/:urlShortenId', getUrlClickMetrics);
  app.all("*", (req, res) => res.status(404).render("error"));
};
