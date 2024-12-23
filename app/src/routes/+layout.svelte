<script lang="ts">
	import queryClient from '$lib/config/tanstack-query';
	import '../style/app.css';
	import '../style/font.css';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/poppins/100.css';
	import '@fontsource/poppins/200.css';
	import '@fontsource/poppins/300.css';
	import '@fontsource/poppins/400.css';
	import '@fontsource/poppins/500.css';
	import '@fontsource/poppins/600.css';
	import '@fontsource/poppins/700.css';
	import '@fontsource/bruno-ace/400.css';
	import '@fontsource-variable/montserrat';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from 'svelte-french-toast';
</script>

<body class="m-0 h-screen w-screen p-0">
	<div class="m-0 h-screen w-full p-0">
		<QueryClientProvider client={queryClient}>
			<slot />
			<Toaster />
		</QueryClientProvider>
	</div>
</body>
