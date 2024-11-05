import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const ingredientsFormat = z.object({
	ingredients: z.array(z.object({
		name: z.string().describe("The human-readable name of the ingredient"),
		unit: z.string().describe("The descriptive and clear short name for the unit for the quantity specified"),
		quantity: z.number().describe("The quantity in the units specified")
	})).describe("An array of ingredients with names, units, and quantities in those units")
})

export async function POST(req: NextRequest) {
	const json = await req.json().catch(e => {
		return NextResponse.json({
			success: false,
			error: "No body was provided"
		}, { status: 400 })
	})

	const parseResult = ingredientsFormat.safeParse(json?.data)

	if (parseResult.success) {
		const model = new ChatAnthropic({
			model: "claude-3-5-sonnet-latest",
			temperature: 0.4
		});

		const ingredientsFormatted = parseResult.data.ingredients.map(ingredient => `${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`).join("\n")

		const ResponseFormatter = z.object({
			name: z.string().describe("The name of the recipe"),
			description: z.string().describe("A short description of the dish to be prepared"),
			steps: z.array(z.object({
				ingredients: z.array(z.string().describe("The name of an ingredient used in this step of the recipe")).describe("An array of ingredient names used in this step of the recipe"),
				step: z.string().describe("A step of the recipe"),
				time: z.string().describe("An estimated time in seconds, minutes, or hours that this step will take")
			})).describe("A list of steps with ingredients, steps, and time")
		}).describe("A recipe containing steps and ingredients used in those steps")

		const output = await model.withStructuredOutput(ResponseFormatter).invoke([
			new SystemMessage("You are an expert chef AI assistant capable of creating delicious recipes from given ingredients. Your task is to generate a detailed recipe when provided with a list of ingredients and their quantities.\nFollow these guidelines:\n1. Analyze the ingredients and quantities to determine a suitable dish that uses only the ingredients given to you.\n2. If ingredients are missing for a complete dish, choose a different recipe that contains only the ingredients given to you.\n3. Try to use all or most of the ingredients given to you.\n4. Use appropriate cooking techniques and consider flavor combinations\n5. Provide an accurate time estimate for each step.\n6. Provide the ingredients required for each step.\n7. Provide a recipe name and a short description of the dish the recipe will make."),
			new HumanMessage(`Please create a recipe using the following ingredients and quantities:\n${ingredientsFormatted}`)
		])

		return NextResponse.json({
			success: true,
			data: {
				recipe: output
			}
		}, { status: 200 })
	} else {
		return NextResponse.json({
			success: false,
			error: "Invalid ingredients format"
		}, { status: 400 })
	}
}