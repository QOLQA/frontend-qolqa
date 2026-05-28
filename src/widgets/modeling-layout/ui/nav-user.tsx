"use client";

import { useState } from "react";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import type { User } from "@fsd/entities/user";
import { useAuthContext } from "@fsd/app/providers";
import { UserProfileDialog } from "@fsd/features/user-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@fsd/shared/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@fsd/shared/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@fsd/shared/ui/sidebar";

function getInitials(name: string): string {
	const names = name.trim().split(" ");
	if (names.length >= 2) {
		return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
}

export function NavUser({ user }: { user: User }) {
	const { isMobile } = useSidebar();
	const { logout, refreshUser, user: authUser } = useAuthContext();
	const [profileOpen, setProfileOpen] = useState(false);

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="size-[2.375rem] md:p-0 mx-auto text-lighter-gray"
							>
								<Avatar className="size-[2.375rem] mx-auto rounded-full">
									<AvatarImage src={user.avatar} alt={user.username} />
									<AvatarFallback className="rounded-full">
										{getInitials(user.username)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight md:hidden">
									<span className="truncate font-semibold">{user.username}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
								<ChevronsUpDown className="ml-auto md:hidden" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8">
										<AvatarImage src={user.avatar} alt={user.username} />
										<AvatarFallback className="rounded-lg">
											{getInitials(user.username)}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{user.username}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={() => setProfileOpen(true)}>
								<UserRound />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={logout}>
								<LogOut />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<UserProfileDialog
				open={profileOpen}
				onOpenChange={setProfileOpen}
				userId={authUser?.id ?? ""}
				onProfileUpdated={refreshUser}
				onAccountDeleted={logout}
			/>
		</>
	);
}
