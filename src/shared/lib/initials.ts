export function getInitials(name: string): string {
	const names = name.trim().split(" ");
	if (names.length >= 2) {
		return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
}
