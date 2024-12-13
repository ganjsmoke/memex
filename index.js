const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
const randomUseragent = require('random-useragent');
const chalk = require('chalk'); // Import chalk for colored logs

// Constants
const BASE_URL = "https://memex-preorder.memecore.com";
const SLEEP_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Helper function to read query IDs from hash.txt
const getQueryIds = (filePath) => {
  return fs.readFileSync(filePath, 'utf8').split('\n').map(id => id.trim()).filter(Boolean);
};

// Helper function to extract username from query_id
const extractUsername = (queryId) => {
  try {
    const params = querystring.parse(queryId); // Parse query_id into key-value pairs
    const user = JSON.parse(decodeURIComponent(params.user)); // Decode and parse the user JSON
    return user.username || "unknown"; // Return the username or "unknown" if not present
  } catch (error) {
    console.error(chalk.red(`Error extracting username from query ID: ${error.message}`));
    return "unknown";
  }
};

// Helper function to get the current timestamp
const getTimestamp = () => new Date().toISOString();

// Sleep function to introduce delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to HTML-encode query_id
const encodeQueryId = (queryId) => querystring.escape(queryId);

// Function to get user info
const getUserInfo = async (queryId, encodedQueryId, userAgent) => {
  try {
    const response = await axios.get(`${BASE_URL}/public/user`, {
      headers: {
        Cookie: `telegramInitData=${encodedQueryId}`,
        'x-telegram-init-data': queryId,
        'User-Agent': userAgent,
      },
    });
    return response.data;
  } catch (error) {
    console.error(chalk.red(`[${getTimestamp()}] Error fetching user info for username: ${error.message}`));
    return null;
  }
};

// Function to check daily status
const checkDailyStatus = async (queryId, encodedQueryId, userAgent) => {
  try {
    const response = await axios.get(`${BASE_URL}/public/user/daily`, {
      headers: {
        Cookie: `telegramInitData=${encodedQueryId}`,
        'x-telegram-init-data': queryId,
        'User-Agent': userAgent,
      },
    });
    return response.data;
  } catch (error) {
    console.error(chalk.red(`[${getTimestamp()}] Error checking daily status for username: ${error.message}`));
    return null;
  }
};

// Function to perform daily check-in
const performCheckIn = async (queryId, encodedQueryId, userAgent) => {
  try {
    const response = await axios.post(`${BASE_URL}/public/user/daily`, {}, {
      headers: {
        Cookie: `telegramInitData=${encodedQueryId}`,
        'x-telegram-init-data': queryId,
        'User-Agent': userAgent,
      },
    });
    if (response.data.success) {
      console.log(chalk.green(`[${getTimestamp()}] Check-in successful.`));
    } else {
      console.log(chalk.red(`[${getTimestamp()}] Failed to check in.`));
    }
  } catch (error) {
    console.error(chalk.red(`[${getTimestamp()}] Error performing check-in: ${error.message}`));
  }
};

// Function to claim SBT
const claimSBT = async (queryId, encodedQueryId, userAgent) => {
  try {
    const response = await axios.post(`${BASE_URL}/schedule/public/user/claim`, {}, {
      headers: {
        Cookie: `telegramInitData=${encodedQueryId}`,
        'x-telegram-init-data': queryId,
        'User-Agent': userAgent,
      },
    });
    if (response.data.success) {
      console.log(chalk.green(`[${getTimestamp()}] SBT claimed.`));
    } else {
      console.log(chalk.red(`[${getTimestamp()}] Failed to claim SBT.`));
    }
  } catch (error) {
    console.error(chalk.red(`[${getTimestamp()}] Error claiming SBT: ${error.message}`));
  }
};

// Function to print header
function printHeader() {
    const line = "=".repeat(50);
    const title = "Auto Checkin Memex";
    const createdBy = "Bot created by: https://t.me/airdropwithmeh";

    const totalWidth = 50;
    const titlePadding = Math.floor((totalWidth - title.length) / 2);
    const createdByPadding = Math.floor((totalWidth - createdBy.length) / 2);

    const centeredTitle = title.padStart(titlePadding + title.length).padEnd(totalWidth);
    const centeredCreatedBy = createdBy.padStart(createdByPadding + createdBy.length).padEnd(totalWidth);

    console.log(chalk.cyan.bold(line));
    console.log(chalk.cyan.bold(centeredTitle));
    console.log(chalk.green(centeredCreatedBy));
    console.log(chalk.cyan.bold(line));
}

// Main function
const main = async () => {
	printHeader();
  const queryIds = getQueryIds('hash.txt');

  while (true) { // Continuous loop to repeat the process every 12 hours

    for (const queryId of queryIds) {
      const encodedQueryId = encodeQueryId(queryId);
      const userAgent = randomUseragent.getRandom(); // Assign a random user-agent for this query ID
      const username = extractUsername(queryId); // Extract the username from the query_id

      console.log(chalk.blueBright(`=======================`));
      console.log(chalk.yellow(`[${getTimestamp()}] Processing user: ${username}`));
      console.log(chalk.blueBright(`=======================`));

      // Get user info
      const userInfo = await getUserInfo(queryId, encodedQueryId, userAgent);
      if (!userInfo) continue;

      const { canClaimSBT } = userInfo.user;

      // Claim SBT if necessary
      if (!canClaimSBT) {
        console.log(chalk.yellow(`[${getTimestamp()}] Attempting to claim SBT for ${username}`));
        await claimSBT(queryId, encodedQueryId, userAgent);
      } else {
        console.log(chalk.green(`[${getTimestamp()}] SBT already claimed for ${username}`));
      }

      // Check daily status
      const dailyStatus = await checkDailyStatus(queryId, encodedQueryId, userAgent);
      if (!dailyStatus) continue;

      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const { fromTime, toTime, content } = dailyStatus;

      // Perform check-in if applicable
      if (
        content === null ||
        (!content.includes(today) && today >= fromTime && today <= toTime)
      ) {
        console.log(chalk.yellow(`[${getTimestamp()}] Attempting to check-in for ${username}`));
        await performCheckIn(queryId, encodedQueryId, userAgent);
      } else {
        console.log(chalk.green(`[${getTimestamp()}] Already checked in today for ${username}`));
      }
    }

    console.log(chalk.magenta(`[${getTimestamp()}] All query IDs processed. Sleeping for 12 hours...`));
    await sleep(SLEEP_INTERVAL);
  }
};

// Run the script
main().catch((err) => console.error(chalk.red(`[${getTimestamp()}] Error in main function: ${err.message}`)));
