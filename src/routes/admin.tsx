import { A, createAsync, query, RouteSectionProps } from '@solidjs/router'
import { TbChalkboard } from 'solid-icons/tb'
import emails from '@emailtemplates/emails.json'

const links = [
	{ title: 'Participants', href: '/admin/participants' },
	{
		title: 'Emails',
		sublinks: Object.keys(emails).map((emailName) => {
			return { title: emailName, href: `/admin/emails/${emailName}` }
		})
	}
]

export default function AdminLayout(props: RouteSectionProps) {
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
								{link.href ? (
									<A href={link.href} class="px-4 py-2" activeClass="menu-active">
										<span>{link.title}</span>
									</A>
								) : (
									<p class="px-4 py-2">{link.title}</p>
								)}
								{link.sublinks && (
									<ul>
										{link.sublinks.map((l) => (
											<li>
												<A href={l.href} class="px-4 py-2" activeClass="menu-active">
													<span>{l.title}</span>
												</A>
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
