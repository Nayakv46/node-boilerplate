# To run the project

1. This should create a database container with Docker

docker compose up -d

2. Install needed dependecies:

npm install

3. Run the server:

npm run dev

# DevOps info

To build this application run:

npm install

npm run build

Built application should end up in /dist folder.
Running the application should be mde using commands
npm run start

To make the application functional, a postgresql database should be made and connection have to be set up.

## Seeds

In folder:
node-boilerplate\prisma\seeds
Example admin user seed: npx ts-node usersSeed.ts

# Node Express template project

This project is based on a GitLab [Project Template](https://docs.gitlab.com/ee/user/project/#create-a-project-from-a-built-in-template).

Improvements can be proposed in the [original project](https://gitlab.com/gitlab-org/project-templates/express).
