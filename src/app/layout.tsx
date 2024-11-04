import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<html>
				<body className="dark w-full h-screen">
					{children}
					<Toaster />
				</body>
			</html>
		</>
	)
}