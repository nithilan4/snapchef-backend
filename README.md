# Development
1. Populate your .env with your Anthropic API Key and an API secret key
2. Run `npm install` to install dependencies
3. Run `npm run dev` to run the dev server

# API Routes
**IMPORTANT**: You must pass a header `X-Api-Key` with the API secret configured in .env for all requests to the server.

### Identify Ingredients - POST /identify
#### Input: 
```json
{
	imageUrl: string // data image of the image to identify ingredients in
}
```

#### Output:
##### Success
```json
{
	success: true,
	data: {
		ingredients: {
			name: string, // name of the ingredient
			unit: string, // unit the ingredient's quantity is in
			quantity: number // quantity of the specified unit of the ingredient
		}[] // List of ingredients
	}
}
```

##### Failure
```json
{
	success: false,
	error: string // a descriptive error
}
```

### Generate Recipe - POST /recipe
#### Input
```json
{
	ingredients: {
		name: string,
		unit: string,
		quantity: number
	}[]
}
```
#### Output
##### Success
```json
{
	success: true,
	data: {
		recipe: {
			name: string, // Name of the dish to be prepared
			description: string, // Description of the dish to be prepared
			steps: {
				step: string, // Description of the step
				time: string, // Estimated time to complete the step
				ingredients: string[] // Ingredients used within the step of the recipe
			}[] // A list of steps of the recipe's preparataion
		}
	}
}
```
##### Failure
```json
{
	success: false,
	error: string // a descriptive error
}
```