import login from "../utils/login.js";
import { AsyncParser } from "@json2csv/node";
// import fs from "fs/promises";
import date from "date-and-time";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  const logedIn = await login();
  console.log("logedIn");

  const apiRes = await fetch(
    "https://bssservice.blueskymss.com/mvc/api/ui/grid/list",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "access-control-allow-headers": "Origin, Content-Type, X-Auth-Token",
        "access-control-allow-methods":
          "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "access-control-allow-origin": "*",
        authorization: "Bearer " + logedIn.access_token,
        "content-type": "application/json;charset=UTF-8",
        "sec-ch-ua":
          '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer: "https://whiteglove.blueskymss.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: '[{"key":"value","value":"212057"},{"key":"filterId","value":"73179b44-6cc5-4fd2-8695-75c4029530a5"},{"key":"_tcp","value":"whiteglove"},{"key":"gridType","value":1},{"key":"f0","value":"DateTimeType = 0"},{"key":"f1","value":"DateTimeTypeText = \'\'"},{"key":"f2","value":"DateFrom = 01/01/2001"},{"key":"f3","value":"DateFromText = \'Invalid date\'"},{"key":"f4","value":"DateTo = 01/01/2001"},{"key":"f5","value":"DateToText = \'Invalid date\'"},{"key":"f6","value":"RegionId = -1"},{"key":"f7","value":"RegionIdText = \'null\'"},{"key":"f8","value":"FacilityTypeID = 0"},{"key":"f9","value":"FacilityTypeIDText = \'All\'"},{"key":"columns","value":"StartDate,EndDate,FacilityName,UnitName,Duration,NumOfNeeds,NumOfAssigned,DesiredShift,DegreeName,TypeName,RegionName,City,StateIDName,PlPayRate,Description,PostDate,Candidates,Id"},{"key":"orderBy","value":"PlPayRate"},{"key":"pageCount","value":"true"},{"key":"pageNumber","value":1},{"key":"pageSize","value":9999999},{"key":"reqInd","value":1}]',

      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const data = await apiRes.json();
  console.log({ allTimeTotal: data.rows.length });

  const startDate = date.addDays(new Date(new Date().toDateString()), -7);
  const endDate = date.addDays(new Date(new Date().toDateString()), -1);

  console.log({
    startDate,
    endDate,
    totalDayCount: date.subtract(endDate, startDate).toDays() + 1,
  });
  const filteredData = data.rows.filter(
    (row) => date.subtract(new Date(row.PostDate), startDate).toDays() < 8
  );
  const dateSet = new Set(
    filteredData.map((row) => row.PostDate.split("T")[0])
  );
  //filteredData.forEach((row) => consol.log(row.PostDate))
  console.log(dateSet);
  const finalJson = filteredData.map((row) => {
    const payDetailsLines = row.PayDetail.split("\n");
    const payDetails = {};
    payDetailsLines.map((line) => {
      const [key, value] = line.split(":");
      if (key === "-Wkly Stipend")
        payDetails.wklyStipend = value.match(/\d+\.?\d*/g)[0];
      if (key === "-Gross Wkly Pay")
        payDetails.grossWklyPay = value.match(/\d+\.?\d*/g)[0];
      if (key === "-FINDNETICS RECRUITMENT BONUS")
        payDetails.findneticsRecruitmentBonus = value.match(/\d+\.?\d*/g)[0];
    });
    return {
      scId: row.scId,
      scRegionID: row.scRegionID,
      objtype: row.objtype,
      Id: row.Id,
      StatusID: row.StatusID,
      StartDate: row.StartDate.split("T")[0],
      EndDate: row.EndDate.split("T")[0],
      PostDate: row.PostDate.split("T")[0],
      FacilityID: row.FacilityID,
      FacilityName: row.FacilityName,
      UnitName: row.UnitName,
      Duration: row.Duration,
      NumOfNeeds: row.NumOfNeeds,
      NumOfAssigned: row.NumOfAssigned,
      HotJobFl: row.HotJobFl,
      SCOnly: row.SCOnly,
      IsOccupy: row.IsOccupy,
      DesiredShift: row.DesiredShift,
      DegreeName: row.DegreeName,
      TypeName: row.TypeName,
      AlternateTypeName: row.AlternateTypeName,
      RegionName: row.RegionName,
      City: row.City,
      StateID: row.StateID,
      StateIDName: row.StateIDName,
      Description: row.Description.split("</ul>")[0] + "</ul>",
      DescriptionPlainText: row.DescriptionPlainText,
      PayDetail: row.PayDetail,
      ...payDetails,
      ExpectedSalary: row.ExpectedSalary,
      SubmissionCount: row.SubmissionCount,
      SubmissionHint: row.SubmissionHint,
      PlPayRate: row.PlPayRate,
      PlBillRate: row.PlBillRate,
      AvailableProposals: row.AvailableProposals,
      CandidatesList: row.CandidatesList,
      IsPermanentPlacement: row.IsPermanentPlacement,
      ASAP: row.ASAP,
      CategoryID: row.CategoryID,
      UnitDescription: row.UnitDescription,
      OnHold_Fl: row.OnHold_Fl,
      DegreeId: row.DegreeId,
      TypeId: row.TypeId,
      UnitId: row.UnitId,
      AlternateDegreeID: row.AlternateDegreeID,
      AlternateDegreeName: row.AlternateDegreeName,
      AlternateTypeID: row.AlternateTypeID,
    };
  });

  console.log({ sevenDayTotal: filteredData.length });

  const opts = {};
  const transformOpts = {};
  const asyncOpts = {};
  const parser = new AsyncParser(opts, asyncOpts, transformOpts);

  const csv = await parser.parse(finalJson).promise();
  // await fs.writeFile(`${yesterdayDate}.csv`, csv);

  // const transporter = nodemailer.createTransport({
  //   host: process.env["SMTP_HOST"],
  //   port: process.env["SMTP_PORT"],
  //   secure: false,
  //   auth: {
  //     user: process.env["SMTP_USER"],
  //     pass: process.env["SMTP_PASS"],
  //   },
  //   tls: {
  //     ciphers: "SSLv3",
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env["GMAIL_ID"],
      pass: process.env["GMAIL_PASS"],
    },
  });

  const info = await transporter.sendMail({
    from: `Bluesky Scraper BOT <${process.env["GMAIL_ID"]}>`, // sender address
    to: process.env["RECIVER_EMAIL"], // list of receivers
    subject: `[${startDate.toISOString().split("T")[0]}-TO-${
      endDate.toISOString().split("T")[0]
    }] ${filteredData.length} New Job - Bluesky Scraper Bot`, // Subject line
    attachments: [
      {
        filename: `${startDate.toISOString().split("T")[0]}_${
          endDate.toISOString().split("T")[0]
        }.csv`,
        content: csv,
      },
    ],
  });
  return res.json({ success: true });
}
