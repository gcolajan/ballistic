Ballistic Finance Manager
=======

Ballistic tracks investments, assets, debts, and general accounts. It can also calculate the growth of investments and time until investment goals are reached based on past behaviour.

Features
=====

### Complete

* General Account Tracking
* Investment Account Tracking
* Time to Investment Goal Prediction
* Account and Global Statistics

### In Progress

* Edit/Delete Transactions
* Edit/Delete Accounts
* Asset Account Tracking
* Debt Account Tracking

Installation
=======

In order to run Ballistic, follow these steps:

1. Set up a PostgreSQL database and update the database credentials located in `config/db.json`.
2. Run `npm install`.
3. Run `npm run run`.

Ballistic should now be running on port 3000.

**IMPORTANT:** Ballistic is not ready for production use. It is incomplete and contains known security issues that have not yet be fixed.