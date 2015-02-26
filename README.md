Ballistic Finance Manager
=======

Ballistic tracks investments, assets, debts, and general accounts. It can also calculate the growth of investments and time until investment goals are reached based on past behaviour. A hosted instance of the application is available at [ballisticfinance.com](https://ballisticfinance.com/).

Features
=====

* General Account Tracking
* Investment Account Tracking
* Asset Account Tracking
* Debt Account Tracking
* Time to Investment Goal Prediction
* Account and Global Statistics

Installation
=======

In order to run Ballistic, follow these steps:

1. Set up a PostgreSQL database and update the database credentials located in `config/db.json`.
2. Run `npm install`.
3. Run `npm start`.

Ballistic should now be running on port 3000. By default it will run in development mode.

**IMPORTANT:** If you're using ballistic in production, be sure to update `config/security.json` with new secret tokens.