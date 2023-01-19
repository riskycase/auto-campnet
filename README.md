# Auto Campnet

Command line utility to connect to BITS Goa's LDAP server, for headless devices

## Requirements

- [Node.js](https://nodejs.org/)
- [PM2](https://pm2.io/) (Optional)

## Installation

- Clone the repository and install the dependencies with following command
```sh
npm i
```
- Create a `.env` file and fill it with your values
```sh
cp .env.example .env
```
- Transpile the TypeScript code to JavaScript code so Node.js can execute it
```sh
npm run compile
```

- Execute the generated `dist/index.js` file with Node.js
```sh
node dist/index.js
```
or
```sh
npm run start
```

## Running at startup/restarting at changes (PM2)

From the code directory run
```sh
pm2 startup
pm2 start  --watch dist dist/index.js
```

**NOTE: This will restart the application everytime a file change is detected in `dist` directory**
