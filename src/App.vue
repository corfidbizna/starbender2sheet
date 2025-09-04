<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
	<!-- <header>
		<nav>
			<RouterLink :to="{ name: 'home' }"
				><img
					class="logo"
					src="/src/assets/icons/slot_tricorn.png"
			/></RouterLink>
		</nav>
		<h1>STARBENDER 2: Season of Collapse</h1>
	</header> -->
	<RouterView />
</template>

<style scoped>
h1 {
	margin: 0;
}
header {
	max-height: 100vh;
	display: flex;
	place-items: top;
}

.logo {
	display: block;
}

nav {
	width: 100%;
	font-size: 12px;
	text-align: center;
	width: min-content;
}

nav a.router-link-exact-active {
	color: var(--color-text);
}

nav a.router-link-exact-active:hover {
	background-color: transparent;
}

nav a {
	display: inline-block;
	padding-left: 1rem;
}
/*
@media (min-width: 1024px) {
	header {
		display: flex;
		place-items: center;
	}

	header .wrapper {
		display: flex;
		place-items: flex-start;
		flex-wrap: wrap;
	}

	nav {
		text-align: left;
		margin-left: -1rem;
		font-size: 1rem;
	}
} */
</style>
