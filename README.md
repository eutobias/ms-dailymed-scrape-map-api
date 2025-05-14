# DailyMed Scrape Mapping API

## Description

This is a NestJS/SQLite application, whose purpose is to scrape the DailyMed website for medication information and map it to a standardized format, has a CRUD to handle users and authentication with diferent access levels, expose it to the client a REST API to interact with it.

---

## How it works

Let´s start with the initialization of the application, besides registering all routes, modules and other needs, during initializion, the `dailymed-indications.controller` starts to listen for two events:

- **IndicationEvents.SCRAPE_INDICATIONS**: triggered by `task-runner.service` when `onApplicationBootstrap` is called, which scrape and parse the indications from DailyMed website, and stores it in a temporary file `tmp/dailymed-indications.json`.
- **IndicationEvents.MAP_INDICATIONS**: triggered by the same controller, runs after sucessfully scrape data from DailyMed website, then read the temporary file `tmp/dailymed-indications.json`, get the ICD-10 code for each respective indication using a IA tool (at this moment `meta-llama/llama-4-maverick-17b-128e-instruct` throw [groqcloud api](https://groq.com/)) and stores it in sqlite database to be consumed by the api.

The events are registered in a cronjob to run every 24 hours and update the stored data.

---

### API Documentation

The application has  a swagger documentation, you can access it by going to `http://localhost:3000/swagger-api` in your browser.

#### Users

- `/api/v1/users`: GET - List all users
- `/api/v1/users`: POST - Create a new user
- `/api/v1/users/:id`: GET - Get a user by id
- `/api/v1/users/:id`: PUT - Update a user by id
- `/api/v1/users/:id`: DELETE - Delete a user by id

#### Auth

There's already a user created with the following credentials:
Login: **admin**
Password: **strongPassword123**

- `/api/v1/auth/login`: POST - Login a user

#### Programs

- `/api/v1/programs?query`: GET - List all programs with a optional query parameter
- `/api/v1/programs/:id`: GET - Get a program by id

---

### Step-by-step setup

Clone the repository and follow the instructions bellow:

#### Running the app

You need to have docker or similar installed to run the application, just enter in the application root directory and run the command docker commands as bellow:

```bash
git clone https://github.com/eutobias/ms-dailymed-scrape-map-api
cd ms-dailymed-scrape-map-api
docker-compose up
```

#### Development

If you want to run the application in development mode, you need to have node (any version after than 20) and npm installed, just enter in the application root directory and run the command bellow:

```bash
git clone https://github.com/eutobias/ms-dailymed-scrape-map-api
cd ms-dailymed-scrape-map-api
npm install
npm run start:dev
```

### Sample output

  `/api/v1/users`

  ```json
  [
    {
        "id": 1,
        "username": "admin",
        "accesslevel": 100
    },
    {
        "id": 2,
        "username": "user1",
        "accesslevel": 1
    },
    {
        "id": 3,
        "username": "user50",
        "accesslevel": 50
    }
  ]
```

`/api/v1/users/:id`

 ```json
 {
    "id": 2,
    "username": "user1",
    "accesslevel": 1
}
```

  `/api/v1/programs`

  ```json
[
    {
        "id": 29,
        "indication": "Atopic Dermatitis",
        "description": "DUPIXENT is indicated for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe atopic dermatitis (AD) whose disease is not adequately controlled with topical prescription therapies or when those therapies are not advisable. DUPIXENT can be used with or without topical corticosteroids.",
        "code": "L20.9"
    },
    {
        "id": 30,
        "indication": "Asthma",
        "description": "DUPIXENT is indicated as an add-on maintenance treatment of adult and pediatric patients aged 6 years and older with moderate-to-severe asthma characterized by an eosinophilic phenotype or with oral corticosteroid dependent asthma .",
        "code": "J45.50"
    },
    {
        "id": 31,
        "indication": "Chronic Rhinosinusitis with Nasal Polyps",
        "description": "DUPIXENT is indicated as an add-on maintenance treatment in adult and pediatric patients aged 12 years and older with inadequately controlled chronic rhinosinusitis with nasal polyps (CRSwNP).",
        "code": "J33.9"
    },
    {
        "id": 32,
        "indication": "Eosinophilic Esophagitis",
        "description": "DUPIXENT is indicated for the treatment of adult and pediatric patients aged 1 year and older, weighing at least 15 kg, with eosinophilic esophagitis (EoE).",
        "code": "K20.0"
    },
    {
        "id": 33,
        "indication": "Prurigo Nodularis",
        "description": "DUPIXENT is indicated for the treatment of adult patients with prurigo nodularis (PN).",
        "code": "L28.1"
    },
    {
        "id": 34,
        "indication": "Chronic Obstructive Pulmonary Disease",
        "description": "DUPIXENT is indicated as an add-on maintenance treatment of adult patients with inadequately controlled chronic obstructive pulmonary disease (COPD) and an eosinophilic phenotype.",
        "code": "J44.9"
    },
    {
        "id": 35,
        "indication": "Chronic Spontaneous Urticaria",
        "description": "DUPIXENT is indicated for the treatment of adult and pediatric patients aged 12 years and older with chronic spontaneous urticaria (CSU) who remain symptomatic despite H1 antihistamine treatment.",
        "code": "L50.1"
    }
]
```

  `/api/v1/programs?query=sinusitis`

  ```json
[
    {
        "id": 31,
        "indication": "Chronic Rhinosinusitis with Nasal Polyps",
        "description": "DUPIXENT is indicated as an add-on maintenance treatment in adult and pediatric patients aged 12 years and older with inadequately controlled chronic rhinosinusitis with nasal polyps (CRSwNP).",
        "code": "J33.9"
    }
]
```

`/api/v1/programs/:id`

```json
{
    "id": 33,
    "indication": "Prurigo Nodularis",
    "description": "DUPIXENT is indicated for the treatment of adult patients with prurigo nodularis (PN).",
    "code": "L28.1"
}
```

That's it! :)
