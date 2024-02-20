import dotenv from 'dotenv'

dotenv.config()

const username = process.env["USER_NAME"];
const password = process.env["PASSWORD"];

export default async function login() {
  const res = await fetch(
    `https://bssservice.blueskymss.com/auth//token?noCache=${
      new Date(Date.now()) + Math.random()
    }`,
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua":
          '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://whiteglove.blueskymss.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `username=${username}&password=${password}&grant_type=password&client_id=whiteglove&application_key=80F84BD3D8BB4323BF721FF187AC9B7F`,
      method: "POST",
    },
  );

  const data = await res.json();
  return data;
}
