# Janela - electron desktop background picker

Make sure to check out [electron-webpack's documentation](https://webpack.electron.build/) for more details.

## Getting Started


1. Create an Unsplash Account Developer account - https://unsplash.com/developers

2. Clone  This Repository
```
git clone https://github.com/rafh/janela.git
```
```
cd janela
```

3. Create an `.env` file - Once this is created the following props
```
NODE_ENV=
API_KEY=
```

4. install dependencies - The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.
```
yarn
```

### Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```
