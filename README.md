# birthday-reminder-app
## How to run this project 
1. clone this repository
2. import "users.sql.gz" to your database
3. run "npm install"
4. import "Assessment-SDT.postman_collection.json" to your postman
5. reconfigure database configuration in "./config/db.config.js", especially the user & password.
6. run "node server.js"
7. test the API

## Important Notes
1. Please clear all the data with name "assessment-sdt" in your database
2. Please clear all the data with name "Assessment-SDT" in your postman

## Cron Job
There are 3 cron job in this project :
1. birthday cron job => the purpose of this cron job is to send birthday email every 9 am on users' local time, then this cron job will update the 'is_sent' field on the database to "1"
2. backup birthday cron job => the purpose of this cron job is to send (yesterday) birthday email every 30 minutes on users that has "0" in 'is_sent' status, after the birthday email is sent, then the cron job will update the 'is_sent' field from "0" to "1".
3. reset 'is_sent' cron job => the purpose of this cron job is to reset 'is_sent' field to 0 every 00:00:00 on 1 january
