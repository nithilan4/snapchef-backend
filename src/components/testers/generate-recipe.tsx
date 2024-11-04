import { ArrowDown, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Ingredient } from "@/app/page";
import axios from "axios";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
	});
}

type Recipe = {
	name: string,
	description: string,
	steps: {
		step: string,
		time: string,
		ingredients: string[]
	}[]
}

export default function GenerateRecipeTester({ ingredients }: { ingredients: Ingredient[] }) {
	const [recipe, setRecipe] = useState<Recipe | null>(null)
	const [step, setStep] = useState<number>(0)
	const [recipeGenerating, setRecipeGenerating] = useState(false)

	async function generateRecipe() {
		setRecipeGenerating(true)
		const res = await axios.post("/recipe", {
			headers: {
				"X-Api-Key": process.env.NEXT_PUBLIC_API_SECRET_FRONTEND
			},
			data: {
				ingredients
			},
			validateStatus: () => true
		})

		if (res?.data.success) {
			toast({
				title: "Generate Recipe Succeeded!",
				description: res.data.data.recipe.name
			})

			setRecipe(res.data.data.recipe)
			setStep(0)
		} else {
			toast({
				title: "Identify Ingredients Failed!",
				description: res?.data.error,
				variant: "destructive"
			})
		}

		setRecipeGenerating(false)
	}

	return (
		<Card className="h-full w-1/2 flex flex-col items-center px-8 py-6 min-w-0 gap-2">
			<p className="text-2xl font-bold">Generate Recipe</p>
			<div className="flex flex-col w-full gap-2 items-center flex-grow-[3] flex-shrink-[3] basis-0 overflow-hidden">
				<p className="text-xl font-medium">Ingredients</p>
				<div className="flex-1 border-border border-2 w-full overflow-auto rounded px-4 py-2">
					{
						ingredients.map((ingredient) => (
							<div className="w-full flex flex-row justify-between text-lg" key={ingredient.name}>
								<p className="font-bold">{toTitleCase(ingredient.name)}</p>
								<div className="flex flex-row items-center gap-2">
									<p>{ingredient.quantity}</p>
									<p className="min-w-[4em] text-right">{ingredient.unit}</p>
								</div>
							</div>
						))
					}
				</div>

				<div className="flex flex-row gap-2 items-center">
					<Button size="lg" className="mt-2" onClick={generateRecipe} disabled={ingredients.length === 0 || recipeGenerating}>Generate Recipe</Button>
					{
						recipeGenerating && (
							<Loader2 className="animate-spin size-10" />
						)
					}
				</div>
			</div>
			{recipe && (
				<>
					<ArrowDown className="text-muted-foreground size-6" />
					<div className="flex flex-col w-full gap-2 flex-grow-[5] flex-shrink-[5] basis-0">
						<p className="text-2xl font-medium my-0">{recipe.name}</p>
						<p>{recipe?.description}</p>
						<div className="w-full flex flex-row justify-center items-center gap-2">
							<Button variant="ghost" disabled={step <= 0} size="icon"
								onClick={() => setStep(step - 1)}
							>
								<ArrowLeft className="size-12" />
							</Button>
							<p className="text-lg font-bold">Step {step + 1}</p>
							<Button variant="ghost" disabled={step >= recipe.steps.length - 1} size="icon"
								onClick={() => setStep(step + 1)}
							>
								<ArrowRight className="size-8" />
							</Button>
						</div>
						<div className="flex-1 border-border border-2 w-full overflow-auto rounded px-4 py-2">
							<p className="text-xl font-bold">Step {step + 1}:</p>
							<p className="text-lg">{recipe.steps[step].step}</p>
							<p>{recipe.steps[step].time}</p>
							<br></br>
							<p className="text-lg font-medium">{recipe.steps[step].ingredients.length === 0 ? "No ingredients used" : "Uses Ingredients:"}</p>
							<ul>
								{
									recipe.steps[step].ingredients.map(ingredient => (
										<li key={ingredient}>{toTitleCase(ingredient)}</li>
									))
								}
							</ul>
						</div>
					</div>
				</>
			)}

		</Card>
	)
}