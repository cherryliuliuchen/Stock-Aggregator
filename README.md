# Stock Aggregator (Alpha Vantage)

[![Node.js Version](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)

> A Node.js + Express backend that aggregates **Top Gainer / Top Loser**, **company Description**, and **Last Month’s Closing Price** from Alpha Vantage.  
> This is a small assignment-style project focusing on API integration and JSON response aggregation. No database is used.

---

## Table of Contents
- [Features](#features)
- [Requirement documents](#requirement-documents)
  - [External APIs](#external-apis)
  - [Requirements](#requirements)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Usage](#usage)
- [Sample Responses](#sample-responses)
- [Project Structure](#project-structure)
- [Notes](#notes)
- [Contact](#contact)

---

## Features
- Aggregates **three** Alpha Vantage APIs into one response.
- Returns **Top Gainer of the Day** and **Top Loser of the Day** with:
  - `ticker` (as join key)
  - `percentageToday` / `currentPrice`
  - `Description` (from `OVERVIEW`)
  - `Last Month Closing Price` (from `TIME_SERIES_MONTHLY`)
- Lightweight Node.js + Express. **No DB**, secrets via `.env`.

---

# Requirement documents

## External APIs
| API Function         | Endpoint Example                                                                                       | Purpose                                                                 |
|----------------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| TOP_GAINERS_LOSERS   | `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=YOUR_KEY`                        | Get top gainers/losers of the day (with `ticker`, `price`, `% change`). |
| TIME_SERIES_MONTHLY  | `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=IBM&apikey=YOUR_KEY`            | Monthly OHLC data → **Last Month Closing Price**.                       |
| OVERVIEW             | `https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=YOUR_KEY`                       | Company overview → **Description**.                                     |

## Requirements
1. **Get Top (Gainer/Loser)**
   - Call **`TOP_GAINERS_LOSERS`**.
   - Sort by `change_percentage`.
   - Extract:
     - **Top Gainer of the Day**
     - **Top Loser of the Day**
   - Keep `ticker` as the foreign key for later steps.

2. **Get Last Month’s Closing Price**
   - Use `ticker` from Step 1.
   - Call **`TIME_SERIES_MONTHLY`**.
   - Map `ticker` → `Symbol`.
   - From `"Monthly Time Series"`, take **the last trading day of the previous month** → `4. close`.

3. **Get Company Description**
   - Use the same `ticker` from Step 1.
   - Call **`OVERVIEW`**.
   - Map `ticker` → `Symbol`.
   - Extract the `Description` field.


4. **Data Processing Logic**


<img src="./assets/Process.png" alt="Process" width="200" height="300"/>

---

## API Endpoints
### 1. Raw movers (direct pass-through summary)
| Method | Endpoint                              | Description                                                   |
|--------|----------------------------------------|---------------------------------------------------------------|
| GET    | `/api/stocks/market-movers`            | Returns `last_updated`, arrays of `top_gainers` and `top_losers`, plus convenience `top_gainer` and `top_loser` (first items). |

### 2. Aggregated result (three APIs combined)
| Method | Endpoint                                     | Description                                                                                                           |
|--------|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| GET    | `/api/stocks/market-movers/aggregate`         | Returns **Top Gainer** and **Top Loser** with `ticker`, `percentageToday`, `currentPrice`, `Description`, `Last Month Closing Price` (with safe fallbacks). |

**Fallback messages used when data is missing:**
- Description → `"Please check description in the official website"`
- Last Month Close → `"Please check Last Months Closing Price in the official website"`

---

## Installation
```bash
git clone https://github.com/yourname/StockData.git
cd StockData
npm install
Create .env in the project root:
PORT=3000
ALPHA_VANTAGE_KEY=your-alpha-vantage-key
```


## Usage

1. Create a .env file in the root directory and configure the environment variables:
    ```bash
    PORT=3000
    DATABASE_URL=your-database-url
    JWT_SECRET=your-jwt-secret
    ```

2. Start the server:
    ``` bash
    npm start
    ```
    The server will run on http://localhost:3000.

3. For development, you can use:
    ```bash
    npm run dev
    ```

## Contact
If you have any questions or feedback, feel free to contact me:


> Email: cherryliuliuchen@gmail.com