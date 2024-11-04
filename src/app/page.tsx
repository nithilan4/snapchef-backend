"use client"

import GenerateRecipeTester from "@/components/testers/generate-recipe"
import IdentifyIngredientsTester from "@/components/testers/identify-ingredients"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

export type Ingredient = {
	name: string,
	unit: string,
	quantity: number
}

export default function Page() {
	const [ingredients, setIngredients] = useState<Ingredient[]>([])

	return (
		<div className="w-full h-full flex flex-col items-center px-12 py-8 gap-6 overflow-hidden">
			<p className="text-4xl font-bold">SnapChef API Test Harness</p>
			<div className="flex flex-row w-full flex-1 gap-2 overflow-hidden items-center">
				<IdentifyIngredientsTester setIngredients={setIngredients} />
				<ArrowRight className="text-muted-foreground size-8" />
				<GenerateRecipeTester ingredients={ingredients} />
			</div>
		</div>
	)
}