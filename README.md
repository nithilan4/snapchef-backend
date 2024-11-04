# Development
1. Populate your .env with your Anthropic API Key and an API secret key
2. Run `npm install` to install dependencies
3. Run `npm run dev` to run the dev server

# API Routes
**IMPORTANT**: You must pass a header `X-Api-Key` with the API secret configured in .env for all requests to the server.

### Identify Ingredients - POST /identify

### Generate Recipe - POST /recipe