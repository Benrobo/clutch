<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Cog from 'lucide-svelte/icons/cog';
	import Lock from 'lucide-svelte/icons/lock';
	import CircleDollarSign from 'lucide-svelte/icons/circle-dollar-sign';
	import Crown from 'lucide-svelte/icons/crown';
	import { authStore } from '$lib/store/auth.store';
	import { onMount } from 'svelte';
	import { cn, isPagePath, lowerCase } from '$lib/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import toast from 'svelte-french-toast';
	import useViewport from '@/hooks/useViewport';
	import { goto } from '$app/navigation';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Divider from '@/components/Divider.svelte';
	import { derived } from 'svelte/store';
	import { page } from '$app/stores';
	import { useGlobalStore } from '@/store/global.store';

	$: globalStore = useGlobalStore();
	const { isMobile } = useViewport();

	$: pathname = derived(page, ($page) => $page.url.pathname);
	$: isSettings = isPagePath($pathname, 'settings');

	$: userMenuOpen = false;

	type MenuItem = {
		icon: any;
		name: string;
		label: string;
		onClick?: () => void;
		disabled?: boolean;
		danger?: boolean;
	};

	const menuItems: MenuItem[] = [
		{
			icon: Cog,
			name: 'settings',
			label: 'Settings',
			disabled: false,
			onClick: () => {
				goto('/app/settings');
			}
		},
		{
			icon: Lock,
			name: 'logout',
			label: 'Logout',
			danger: true,
			onClick: () => {
				// Handle logout
			}
		}
	];

	const reduceString = (str?: string) => {
		if (!str) return '';
		if (str.length > 20) {
			return str.slice(0, 20) + '...';
		}
		return str;
	};

	onMount(() => {
		// console.log($authStore.user);
	});
</script>

<Flex className="w-full h-auto flex-col gap-3 p-2">
	<!-- upgrade card ui -->
	{#if $authStore?.user?.subscription_plan !== 'PRO'}
		<button
			class=" bg-gradient-to-b from-orange-102 from-50% to-orange-103 w-full flex-center px-4 py-3 rounded-md enableBounceEffect"
			on:click={() => {
				if ($isMobile) globalStore.toggleSidebar(false);
			}}
		>
			<Flex className="w-full flex-row items-center justify-center">
				<Crown size={20} class="stroke-white-100" />
				<h1 class="text-white-100 font-poppins font-medium text-sm">Upgrade To Pro</h1>
			</Flex>
		</button>
	{/if}

	<!-- credit card section -->
	<button
		class="w-full"
		on:click={() => {
			const plan = $authStore?.user?.subscription_plan ?? 'FREE';
			if (lowerCase(plan) === 'free') {
				toast.error('Only paid users can access this feature');
			} else {
				if ($isMobile) globalStore.toggleSidebar(false);
			}
		}}
	>
		<Flex
			className={cn(
				'w-full h-auto flex-row gap-3 px-3 py-3 rounded-lg border-[.5px] border-gray-101/50 bg-dark-107/30 text-center justify-between'
			)}
		>
			<p class="text-white-200 font-normal text-[10px] text-nowrap translate-y-1">Credits Left</p>
		</Flex>
	</button>

	<!-- No more popover trigger -->

	<Flex className="w-full h-auto flex-col gap-1 border-[1px] border-gray-101/50 p-2 rounded-md">
		<button
			class="w-full h-auto flex flex-row items-center justify-start gap-2 flex-nowrap py-1 border-none outline-none ring-0"
			on:click={() => (userMenuOpen = !userMenuOpen)}
		>
			<img
				src={$authStore?.user?.avatar}
				alt=""
				class="w-[30px] h-[30px] rounded-full"
				on:error={(e) => {
					// @ts-expect-error
					e.currentTarget.src = '/avatar.png';
				}}
			/>
			<Flex className="w-auto flex-col gap-0">
				<Flex className="w-full justify-between">
					<h1 class="text-white-100 font-poppins font-medium text-sm">
						{reduceString($authStore?.user?.name)}
					</h1>
					<ChevronDown size={16} class="stroke-white-100" />
				</Flex>
				<p class="text-white-200 font-normal text-[10px]">
					{reduceString($authStore?.user?.email)}
				</p>
			</Flex>
		</button>
		<Flex
			className={cn(
				'w-full flex-col gap-0 transition-all overflow-hidden',
				userMenuOpen ? 'h-[70px]' : 'h-0'
			)}
		>
			<Divider />
			{#each menuItems as item}
				<button
					class={cn(
						'w-full h-full p-2 flex items-center justify-start gap-2 rounded-md transition-all hover:bg-dark-107 disabled:opacity-50 disabled:cursor-not-allowed',
						item.danger ? 'group text-red-305' : ''
					)}
					on:click={item.onClick}
					disabled={item.disabled}
				>
					<svelte:component
						this={item.icon}
						size={15}
						class={item.danger
							? 'stroke-white-100'
							: isSettings && item.name === 'settings'
								? 'stroke-white-100'
								: 'stroke-white-300'}
					/>
					<h1
						class={cn(
							'font-poppins font-medium text-xs text-white-300',
							isSettings && item.name === 'settings' ? 'text-white-100' : '',
							item.danger ? 'text-red-305 ' : ''
						)}
					>
						{item.label}
					</h1>
				</button>
			{/each}
		</Flex>
	</Flex>
</Flex>
