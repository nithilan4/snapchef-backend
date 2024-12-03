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
	const json = await req.json().catch(e => null)

	if (!json) {
		return NextResponse.json({
			success: false,
			error: "No body was provided"
		}, { status: 400 })
	}

	if (!json?.data?.imageUrl) {
		return NextResponse.json({
			success: false,
			error: "No image URL was provided"
		}, { status: 400 })
	}

	const model = new ChatAnthropic({
		model: "claude-3-5-sonnet-latest",
		temperature: 0.4
	});

	const output = await model.withStructuredOutput(ingredientsFormat).invoke([
		new SystemMessage("You are an advanced AI assistant specialized in analyzing images of cooking ingredients. Your task is to accurately identify ingredients and their qunatities from the provided image. Follow these guidelines:\n1. Carefully examing the entire image for all visible ingredients.\n2. Identify each ingredient by its common name, being clear with pairs.\nEstimate the quantity of each ingredient using appropriate and clear units (e.g., g, cups, tbsp, pieces, etc.).\n4. If an exact measurement is not possible, provide a reasonable estimate.\n5. Do not include any ingredients that are not visible in the image.\n\nRemember, accuracy is crucial for cooking, so be as precise as possible in your identifications and measurements."),
		new HumanMessage({
			content: [
				{
					type: "text",
					text: "Please analyze the following image of cooking ingredients, identifying each ingredient and its quantity, specifying the appropriate unit of measurement:"
				},
				{
					type: "image_url",
					image_url: {
						url: json.data.imageUrl
					}
				}
			]
		})
	])

	return NextResponse.json({
		success: true,
		data: {
			ingredients: output.ingredients
		}
	}, { status: 200 })
}