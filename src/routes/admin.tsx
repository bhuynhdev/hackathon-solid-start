import emails from '@emailtemplates/emails.json'
import { A, RouteSectionProps } from '@solidjs/router'
import IconTablerChalkboard from '~icons/tabler/chalkboard'
import { For, Show } from 'solid-js'

type NavLinkData = {
	title: string
	href?: string
	sublinks?: Array<{ title: string; href?: string }>
}

const links = [
	{ title: 'Participants', href: '/admin/participants' },
	{
		title: 'Emails',
		sublinks: Object.keys(emails).map((emailName) => {
			return { title: emailName, href: `/admin/emails/${emailName}` }
		})
	}
] satisfies Array<NavLinkData>

export default function AdminLayout(props: RouteSectionProps) {
	return (
		<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
			<header class="bg-diagonal-pattern border-b p-4">
				RevolutionUC Dashboard <IconTablerChalkboard class="inline" aria-hidden="true" />
			</header>
			<div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
				{/* Left-side navbar */}
				<nav class="hidden w-64 py-4 md:block" aria-label="Main navigation">
					<ul class="menu w-full space-y-1">
						<For each={links}>
							{(link) => (
								<li>
									<NavLink {...link} />
								</li>
							)}
						</For>
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

type NavLinkProps = NavLinkData & { class?: string }

/**
 * Render a full navlinks with possible sublinks
 */
function NavLink(props: NavLinkProps) {
	return (
		<>
			<Show when={props.sublinks} fallback={<IndividualNavLink {...props} class="px-4 py-2" />}>
				<details open>
					<summary class="px-4 py-2">
						<IndividualNavLink {...props} />
					</summary>
					<ul>
						<For each={props.sublinks}>
							{(subLink) => (
								<li>
									<NavLink {...subLink} />
								</li>
							)}
						</For>
					</ul>
				</details>
			</Show>
		</>
	)
}

/**
 * Render an individual nav link without sublinks
 */
function IndividualNavLink(props: Omit<NavLinkProps, 'sublinks'>) {
	return (
		<Show when={props.href} fallback={<span class={props.class}>{props.title}</span>} keyed>
			{(href) => (
				<A href={href} class={props.class} activeClass="menu-active">
					{props.title}
				</A>
			)}
		</Show>
	)
}
