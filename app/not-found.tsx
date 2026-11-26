import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
			<h1 className="text-4xl font-bold">404</h1>
			<p className="text-lg text-muted-foreground">Página no encontrada</p>
			<Link href="/" className="mt-4 text-primary hover:underline">
				Volver al inicio
			</Link>
		</div>
	)
}
