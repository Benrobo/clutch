<script lang="ts">
	import AuthLayout from '@/components/AuthLayout.svelte';
	import BottomNavTab from '@/components/BottomNavTab.svelte';
</script>

<!-- <AuthLayout> -->
<div class="w-screen h-screen flex flex-center overflow-y-hidden">
	<div class="w-full h-full mx-auto md:max-w-[643px]">
		<slot />
	</div>
</div>
<BottomNavTab />
<!-- </AuthLayout> -->
