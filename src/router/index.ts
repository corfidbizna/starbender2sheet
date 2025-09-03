import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
	history: createWebHashHistory('./'),
	routes: [
		{
			path: '/',
			// will have a list of characters
			name: 'home',
			component: HomeView,
		},
		{
			path: '/character/:characterId',
			name: 'characterOverview',
			props: true,
			component: () => import('../views/CharacterOverview.vue'),
			children: [
				{
					path: 'gameplay',
					name: 'characterGameplay',
					props: true,
					component: () => import('../views/CharacterGameplay.vue'),
				},
				{
					path: 'skills',
					name: 'characterSkills',
					props: true,
					component: () => import('../views/CharacterSkills.vue'),
				},
				{
					path: 'equipment',
					name: 'characterEquipment',
					props: true,
					component: () => import('../views/CharacterEquipment.vue'),
				},
				{
					path: 'lore',
					name: 'characterLore',
					props: true,
					component: () => import('../views/CharacterLore.vue'),
				},
			],
		},
	],
});

export default router;
