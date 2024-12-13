
# Automated Memex Check-in
Register : https://t.me/MemeX_prelaunch_airdrop_bot?start=ref_code=MX480DTV

This Node.js script automates several tasks based on query IDs, such as:
1. Claiming SBT (if eligible).
2. Checking daily status and performing check-ins.


## Features

- **Check-In Automation:** Automatically performs daily check-ins if applicable.
- **SBT Claiming:** Claims SBT for accounts that are eligible.
- **Timed Loop:** Repeats the process for all accounts every 12 hours.

## Requirements

- Node.js (>= 14.0.0)
- Dependencies:
  - `axios`
  - `chalk`
  - `random-useragent`

## Installation

1. Clone this repository:
   ```bash
   git clone github.com/ganjsmoke/memex.git
   ```
2. Navigate to the project directory:
   ```bash
   cd memex
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

1. Place your query IDs in a file named `hash.txt`, with one query ID per line.
2. Run the script:
   ```bash
   node index.js
   ```
3. The script will automatically process each query ID, display logs, and repeat every 12 hours.

## Query ID Format

```
query_id=...&user=%7B%22username%22%3A%22Alexyamin%22%7D&...
```

## Logging

- Logs include timestamps for each operation.
- Color-coded logs for better readability:
  - **Blue:** Separators
  - **Yellow:** Warnings or ongoing actions
  - **Green:** Success messages
  - **Red:** Errors

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Feel free to submit issues and pull requests to improve this script.

---

Happy automating!
