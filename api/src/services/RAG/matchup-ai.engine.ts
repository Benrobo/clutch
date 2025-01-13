import MLBAPIHelper from "../../helpers/mlb/mlb-api.helper.js";
import Gemini from "../../helpers/gemini.helper.js";
import retry from "async-retry";

export default class MatchupAIEngine {
  private gemini: Gemini;
  private mlbApi: MLBAPIHelper;
  constructor() {
    this.gemini = new Gemini();
    this.mlbApi = new MLBAPIHelper();
  }
}
