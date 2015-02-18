Ballistic Finance Manager
=======

Ballistic tracks investments, assets, debts, and general accounts. It can also calculate the growth of investments and time until investment goals are reached based on past behaviour.

Features
=====

### Complete

* General Account Tracking
* Investment Account Tracking
* Asset Account Tracking
* Debt Account Tracking
* Time to Investment Goal Prediction
* Account and Global Statistics
* Delete Transaction

### In Progress

* Edit Transactions
* Edit/Delete Accounts
* Validation
* Improvements to transaction handling for Asset, Debt, and Investment accounts
* General Improvements

Installation
=======

In order to run Ballistic, follow these steps:

1. Set up a PostgreSQL database and update the database credentials located in `config/db.json`.
2. Run `npm install`.
3. Run `npm run run`.

Ballistic should now be running on port 3000.

**IMPORTANT:** Ballistic is not ready for production use. If you're using it in production anyway, be sure to update `config/security.json` with new secret tokens.