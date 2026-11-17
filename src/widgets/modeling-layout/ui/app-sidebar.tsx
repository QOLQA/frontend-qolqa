"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@fsd/features/auth";
import { useSidebarNavStore } from "@fsd/shared/lib/sidebar-nav";
import { Sidebar, useSidebar } from "@fsd/shared/ui/sidebar";
import { SidebarContentPrinc } from "@fsd/widgets/modeling-layout/ui/sidebar-content";
import { SidebarIcons } from "@fsd/widgets/modeling-layout/ui/sidebar-icons";
import type { Data, NavItem } from "@fsd/widgets/modeling-layout/ui/types";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	navItems: NavItem[];
};

const databaseItem = "Database";

export function AppSidebar({ navItems, ...props }: AppSidebarProps) {
	const { setOpen } = useSidebar();
	const { user: authUser } = useAuthContext();
	const activeTitle = useSidebarNavStore((state) => state.activeTitle);
	const setActiveTitle = useSidebarNavStore((state) => state.setActiveTitle);
	const request = useSidebarNavStore((state) => state.request);

	const data: Data = {
		user: {
			id: authUser?.id ?? "",
			username: authUser?.full_name ?? authUser?.username ?? "User",
			email: authUser?.email ?? "",
			is_active: authUser?.is_active ?? false,
			created_at: authUser?.created_at ?? "",
			avatar: authUser?.profile_picture_url ?? authUser?.avatar ?? "/user.png",
		},
		navMain: navItems,
	};

	// Safe: callers always pass at least one nav item (enforced by usage contract)
	const activeItem =
		navItems.find((item) => item.title === activeTitle) ??
		(navItems[0] as NavItem);

	const setActiveItem = (item: NavItem) => setActiveTitle(item.title);

	const handledNonce = useRef(request?.nonce ?? 0);

	useEffect(() => {
		setActiveTitle((navItems[0] as NavItem).title);
		// Reset to the default panel only when the sidebar mounts.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!request || request.nonce === handledNonce.current) return;
		handledNonce.current = request.nonce;
		const target = navItems.find((item) => item.title === request.title);
		if (!target) return;
		setActiveTitle(target.title);
		setOpen(target.title !== databaseItem);
	}, [request, navItems, setActiveTitle, setOpen]);

	return (
		<Sidebar
			collapsible="icon"
			className="overflow-hidden h-full [&>[data-sidebar=sidebar]]:flex-row [&>[data-sidebar=sidebar]]:bg-secondary-gray pb-5 bg-secondary-gray"
			{...props}
		>
			<SidebarIcons
				data={data}
				activeItem={activeItem}
				setActiveItem={setActiveItem}
				setOpen={setOpen}
			/>
			<SidebarContentPrinc activeItem={activeItem} />
		</Sidebar>
	);
}
