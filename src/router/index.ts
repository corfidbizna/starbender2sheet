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
					path: '/',
					redirect: 'characterGameplay',
				},
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
					path: 'quests',
					name: 'questList',
					props: true,
					component: () => import('../views/QuestList.vue'),
				},
				{
					path: 'lore',
					name: 'characterLore',
					props: true,
					component: () => import('../views/CharacterLore.vue'),
				},
				{
					path: 'settings',
					name: 'settings',
					props: true,
					component: () => import('../views/SettingsList.vue'),
				},
			],
		},
	],
});

export default router;
