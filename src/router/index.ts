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
			],
		},
	],
});

export default router;
