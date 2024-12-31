<script lang="ts">
	import Logo from '@/components/branding/Logo.svelte';
	import Flex from '@/components/Flex.svelte';
</script>

<Flex className="w-full h-screen absolute top-0 left-0 flex-center  z-[1]">
	<Flex className="w-full h-auto flex-center flex-col gap-4 px-10 text-center">
		<Logo size={80} className="stroke-dark-100 text-red-305 drop-shadow-lg" />
		<h1 class="text-white-200 font-recoleta font-semibold text-2xl">Your Digital Baseball Mind</h1>
	</Flex>
</Flex>
