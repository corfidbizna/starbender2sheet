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
			name: 'characterOverviewDontManuallyRouteToMeRouteToMyChildren',
			props: true,
			component: () => import('../views/CharacterOverview.vue'),
			children: [
				{
					path: 'gameplay',
					name: 'characterGameplay',
					props: true,
					component: () => import('../views/CharacterGameplay.vue'),
					children: [
						{
							path: 'weapons',
							name: 'characterGameplayWeapons',
							props: true,
							component: () => import('../views/CharacterGameplayWeapons.vue'),
						},
						{
							path: 'armor',
							name: 'characterGameplayArmor',
							props: true,
							component: () => import('../views/CharacterGameplayArmor.vue'),
						},
						{
							path: 'skills',
							name: 'characterGameplaySkills',
							props: true,
							component: () => import('../views/CharacterGameplaySkills.vue'),
						},
						{
							path: 'buffs',
							name: 'characterGameplayBuffs',
							props: true,
							component: () => import('../views/CharacterGameplayBuffs.vue'),
						},
						{
							path: 'artifact',
							name: 'characterGameplayArtifact',
							props: true,
							component: () => import('../views/CharacterGameplayArtifact.vue'),
						},
					],
				},
				{
					path: 'skills',
					name: 'characterSkills',
					props: true,
					component: () => import('../views/CharacterSkills.vue'),
				},
				{
					path: 'buffs',
					name: 'characterBuffs',
					props: true,
					component: () => import('../views/CharacterBuffs.vue'),
				},
				{
					path: 'loadout',
					name: 'characterLoadoutButPleaseDontUseThisOneDirectly',
					props: true,
					component: () => import('../views/CharacterLoadout.vue'),
					children: [
						{
							path: 'weapons',
							name: 'characterWeapons',
							props: true,
							component: () => import('../views/CharacterLoadoutWeapons.vue'),
						},
						{
							path: 'armor',
							name: 'characterArmor',
							props: true,
							component: () => import('../views/CharacterLoadoutArmor.vue'),
						},
						{
							path: 'class',
							name: 'characterClass',
							props: true,
							component: () => import('../views/CharacterLoadoutClass.vue'),
						},
					],
				},
				{
					path: 'artifact',
					name: 'seasonalArtifact',
					props: true,
					component: () => import('../views/SeasonalArtifact.vue'),
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
