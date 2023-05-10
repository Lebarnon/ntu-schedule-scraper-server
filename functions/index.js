const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const {scheduleScraper} = require("./ntuScheduleScraper");
const {formatData} = require("./scheduleFormatter");
const {clashFinder} = require("./clashFinder");
const {generateScheduleCombinations} = require("./scheduleCombinator");
const {checkRawData} = require("./checkRawData");
const cors = require("cors")({origin: "https://ntu-schedule-maker.firebaseapp.com"});

admin.initializeApp();
// const db = admin.firestore();
const app = express();
app.use(cors);

app.post("/generate-timetables", async (req, res) => {
  cors(req, res, async ()=>{
    try {
      const courseCodes = req.body;
      const rawScheduleData = await scheduleScraper(courseCodes);
      const error = checkRawData(rawScheduleData);
      // functions.logger.log("rawScheduleData", rawScheduleData);
      if (error) {
        res.json({
          success: false,
          errorCode: 0,
          errorInfo: error,
          timetables: [],
        });
        res.status(200).end();
      } else {
        const formattedData = formatData(rawScheduleData);

        const scheduleCombinations = generateScheduleCombinations(formattedData);
        functions.logger.log("scheduleCombinations", scheduleCombinations.length);

        const allPossibleTimetables = scheduleCombinations.filter((combination) => !clashFinder(combination.data));
        functions.logger.log("allPossibleTimetables", allPossibleTimetables.length);

        res.json({
          success: true,
          timetables: allPossibleTimetables,
          totalCombinations: scheduleCombinations.length,
          successfulCombinations: allPossibleTimetables.length,
        });
        res.status(200).end();
      }
    } catch (e) {
      console.log("ERROR", e);
      res.status(500).end();
    }
  });
});

exports.app = functions.runWith({memory: "1GB"}).region("asia-east2").https.onRequest(app);
