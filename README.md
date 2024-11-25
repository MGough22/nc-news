# Northcoders News API

For instructions, please head over to [L2C NC News](https://l2c.northcoders.com/courses/be/nc-news).

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

## Setup Instructions

To run this project, create the following `.env` files to configure the environment for your development and testing databases. Follow the steps below:

### Step 1: Create `.env` Files

Add the following `.env` files in the root of your project directory:

- **`.env.development`**
- **`.env.test`**

### Step 2: Define Database Variables

Add the following lines to the respective `.env` files:

#### `.env.development`

PGDATABASE=nc_news

#### `.env.test`

PGDATABASE=nc_news_test
