import { A, createAsync, query, RouteSectionProps } from '@solidjs/router'
import { TbChalkboard } from 'solid-icons/tb'
import { convertPathToModuleName } from '~/utils'

const getLinks = query(async () => {
	'use server'
	return [
		{ title: 'Participants', href: '/admin/participants' },
		{
			title: 'Emails',
			sublinks: Object.keys(import.meta.glob('../email_templates/*.tsx')).map((path) => {
				const moduleName = convertPathToModuleName(path)
				return { title: moduleName, href: `/admin/emails/${moduleName}` }
			})
		}
	]
}, 'nav-links')

export const route = {
	preload: () => getLinks()
}

export default function AdminLayout(props: RouteSectionProps) {
	const links = createAsync(() => getLinks())
	return (
		<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
			<header class="bg-diagonal-pattern border-b p-4">
				RevolutionUC Dashboard <TbChalkboard class="inline" />
			</header>
			<div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
				{/* Left sidebar */}
				<nav class="w-64 py-4" aria-label="Main navigation">
					<ul class="menu w-full space-y-1">
						{links()?.map((link) => (
							<li>
								{link.href ? (
									<a href={link.href} class="px-4 py-2">
										<span>{link.title}</span>
									</a>
								) : (
									<p class="px-4 py-2">{link.title}</p>
								)}
								{link.sublinks && (
									<ul>
										{link.sublinks.map((l) => (
											<li>
												<a href={l.href} class="px-4 py-2">
													<span>{l.title}</span>
												</a>
											</li>
										))}
									</ul>
								)}
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
