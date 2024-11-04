import { Dispatch, SetStateAction, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Image, Loader2 } from "lucide-react"
import axios from "axios"
import { toast, useToast } from "@/hooks/use-toast"
import { Ingredient } from "@/app/page"

const presetImageUrlMap: Record<string, string> = {
	Burger: "/ingredients/burger.png",
	Salad: "/ingredients/salad.jpg",
	Pasta: "/ingredients/pasta.jpg"
}

export default function IdentifyIngredientsTester({ setIngredients }: { setIngredients: Dispatch<SetStateAction<Ingredient[]>> }) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [identifyIngredientsLoading, setIdentifyIngredientsLoading] = useState(false)

	function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0]

			if (["image/jpg", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
				setSelectedImage("custom")
				const reader = new FileReader()

				reader.addEventListener('load', () => {
					const url = reader.result
					if (url) {
						setImageUrl(url.toString())
					}
				})

				reader.readAsDataURL(file)
			}
		}
	}

	async function setPresetImage(name: string) {
		setSelectedImage(name)
		const file = await fetch(presetImageUrlMap[name]).then(res => res.blob())
		const reader = new FileReader()

		reader.addEventListener('load', () => {
			const url = reader.result
			if (url) {
				setImageUrl(url.toString())
			}
		})

		reader.readAsDataURL(file)
	}

	async function identifyIngredients() {
		if (imageUrl) {
			setIdentifyIngredientsLoading(true)
			const res = await axios.post("/identify", {
				headers: {
					"X-Api-Key": process.env.NEXT_PUBLIC_API_SECRET_FRONTEND
				},
				data: {
					imageUrl
				},
				validateStatus: () => true
			})

			if (res?.data.success) {
				toast({
					title: "Identify Ingredients Succeeded!",
					description: `${res.data.data.ingredients.length} ingredients identified`
				})
				setImageUrl(undefined)
				setSelectedImage(null)

				setIngredients(res.data.data.ingredients)
			} else {
				toast({
					title: "Identify Ingredients Failed!",
					description: res?.data.error,
					variant: "destructive"
				})
			}

			setIdentifyIngredientsLoading(false)
		}
	}

	return (
		<Card className="h-full w-1/2 flex flex-col items-center px-8 py-6 min-w-0 gap-4">
			<p className="text-2xl font-bold">Identify Ingredients</p>
			<div className="flex flex-col items-center gap-2">
				<p className="text-lg font-medium">Select from below:</p>
				<div className="flex flex-row gap-2">
					{
						Object.keys(presetImageUrlMap).map(preset => (
							<Button disabled={identifyIngredientsLoading} key={preset} variant={selectedImage == preset ? "default" : "outline"} onClick={() => setPresetImage(preset)}>{preset}</Button>
						))
					}
				</div>
				<p>OR</p>
				<Button disabled={identifyIngredientsLoading} variant={selectedImage === "custom" ? "default" : "outline"} onClick={() => fileInputRef.current?.click()}>{selectedImage === "custom" ? "Select another image from file" : "Select an image from file"}</Button>
				<input type="file" accept=".png, .jpg, .jpeg" className="hidden" ref={fileInputRef} onChange={handleFileInputChange} />
			</div>

			<div className="rounded overflow-hidden border-border border-4 min-w-[32em] max-w-full object-cover flex-1 flex justify-center items-center">
				{imageUrl ? (
					<img className="w-full h-full object-cover rounded" src={imageUrl} />

				) : (
					<div className="w-full h-full flex flex-col justify-center items-center px-10">
						<Image className="text-muted-foreground size-24" />
						<p className="text-lg text-muted-foreground font-medium">Select an image above to identify ingredients</p>
					</div>
				)}
			</div>

			<div className="flex flex-row gap-2 items-center">
				<Button size="lg" onClick={identifyIngredients} disabled={!imageUrl || identifyIngredientsLoading}>Identify Ingredients</Button>
				{
					identifyIngredientsLoading && (
						<Loader2 className="animate-spin size-10" />
					)
				}
			</div>
		</Card>
	)
}