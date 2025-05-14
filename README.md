# DailyMed Scrape Mapping API

## Description

This is a NestJS/SQLite application, whose purpose is to scrape the DailyMed website for medication information and map it to a standardized format, has a CRUD to handle users and authentication with diferent access levels, expose it to the client a REST API to interact with it.

---

## How it works

Let´s start with the initialization of the application, besides registering all routes, modules and other needs, during initializion, the `dailymed-indications.controller` starts to listen for two events:

- **IndicationEvents.SCRAPE_INDICATIONS**: triggered by `task-runner.service` when `onApplicationBootstrap` is called, which scrape and parse the indications from DailyMed website, and stores it in a temporary file `tmp/dailymed-indications.json`.
- **IndicationEvents.MAP_INDICATIONS**: triggered by the same controller, runs after sucessfully scrape data from DailyMed website, then read the temporary file `tmp/dailymed-indications.json`, get the  ICD-10 code for each respective indication using a IA tool and stores it in sqlite database to be consumed by the api.

The events are registered in a cronjob to run every 24 hours.

---

### Routes

#### Users

- `/api/v1/users`: GET - List all users
- `/api/v1/users`: POST - Create a new user
- `/api/v1/users/:id`: GET - Get a user by id
- `/api/v1/users/:id`: PUT - Update a user by id
- `/api/v1/users/:id`: DELETE - Delete a user by id

#### Auth

- `/api/v1/auth/login`: POST - Login a user

#### Programs

- `/api/v1/programs?query`: GET - List all programs with a optional query parameter
- `/api/v1/programs/:id`: GET - Get a program by id

---

### How to start

Clone the repository and follow the instructions bellow:

#### Running the app

You need to have docker or similar installed to run the application, just enter in the application root directory and run the command docker commands as bellow:

```bash
git clone #URL
docker-compose up
```
