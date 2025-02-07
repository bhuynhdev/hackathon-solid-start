import { RouteSectionProps, useLocation } from '@solidjs/router'
import { TbChalkboard } from 'solid-icons/tb'

const links = [
	{ title: 'Participants', href: '/admin/participants' },
	{ title: 'Emails', href: '/admin/emails' }
]

export default function AdminLayout(props: RouteSectionProps) {
	const location = useLocation()
	return (
		<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
			<header class="bg-diagonal-pattern border-b p-4">
				RevolutionUC Dashboard <TbChalkboard class="inline" />
			</header>
			<div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
				{/* Left sidebar */}
				<nav class="w-64 py-4" aria-label="Main navigation">
					<ul class="menu w-full space-y-1">
						{links.map((link) => (
							<li>
								<a href={link.href} class="px-4 py-2" classList={{ 'menu-active': location.pathname === link.href }}>
									<span>{link.title}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
				{/* Main Content */}
				<main class="p-4">{props.children}</main>
			</div>
			{/* Footer */}
			<footer class="p-4">(footer)</footer>
		</div>
	)
}
