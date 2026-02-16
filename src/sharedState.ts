import { computed, ref } from 'vue';
import type { CharacterNames } from './composables/useCharacterData';

type SavedCharacterData = {
	name: string;
	// Lists
	armorList: string;
	weaponList: string;
	artifactModList: string;
	// Resources
	health: string;
	shields: string;
	ammoKinetic: string;
	ammoSpecial: string;
	ammoHeavy: string;
	energySuper: string;
	energyGrenade: string;
	energyMelee: string;
	energyClass: string;
};

// Info
export const currentCharacterState = ref<Record<CharacterNames, SavedCharacterData>>({
	kara: {
		name: 'Kara',
		armorList: '[]',
		weaponList: '[]',
		artifactModList: '[]',
		health: '0',
		shields: '0',
		ammoKinetic: '0',
		ammoSpecial: '0',
		ammoHeavy: '0',
		energySuper: '0',
		energyGrenade: '0',
		energyMelee: '0',
		energyClass: '0',
	},
	aurora: {
		name: 'Aurora',
		armorList: '[]',
		weaponList: '[]',
		artifactModList: '[]',
		health: '0',
		shields: '0',
		ammoKinetic: '0',
		ammoSpecial: '0',
		ammoHeavy: '0',
		energySuper: '0',
		energyGrenade: '0',
		energyMelee: '0',
		energyClass: '0',
	},
	mark: {
		name: 'Mark',
		armorList: '[]',
		weaponList: '[]',
		artifactModList: '[]',
		health: '0',
		shields: '0',
		ammoKinetic: '0',
		ammoSpecial: '0',
		ammoHeavy: '0',
		energySuper: '0',
		energyGrenade: '0',
		energyMelee: '0',
		energyClass: '0',
	},
	lewis: {
		name: 'Lewis Reed',
		armorList: '[]',
		weaponList: '[]',
		artifactModList: '[]',
		health: '0',
		shields: '0',
		ammoKinetic: '0',
		ammoSpecial: '0',
		ammoHeavy: '0',
		energySuper: '0',
		energyGrenade: '0',
		energyMelee: '0',
		energyClass: '0',
	},
});
export const storeLocalStorageInfo = (
	characterId: CharacterNames,
	destination: keyof SavedCharacterData,
	info: string,
) => {
	currentCharacterState.value[characterId][destination] = info;
	localStorage.setItem(characterId, JSON.stringify(currentCharacterState.value[characterId]));
};
export const getLocalStorageInfo = (
	characterId: CharacterNames,
	destination: keyof SavedCharacterData,
): string => {
	const characterData: SavedCharacterData = JSON.parse(localStorage.getItem(characterId) || '');
	return characterData[destination];
};

// Game State
export const actionLog = ref<string>('');
export const updateLog = (text: string) => {
	actionLog.value = text + '\n\n\n' + actionLog.value;
};
export const storeGameState = (turnCount: number) => {
	localStorage.setItem('actionLog', actionLog.value);
	localStorage.setItem('turns', turnCount + '');
};
export const getGameState = () => {
	actionLog.value = localStorage.getItem('actionLog') || '';
	return {
		log: localStorage.getItem('actionLog'),
		turns: parseInt(localStorage.getItem('turns') || '0'),
	};
};

// Settings
const defaultBGColor = '#ffffff';
const defaultBanner = 'https://wallpapershigh.com/wp-content/uploads/destiny-2-logo-5.webp';
export const bgColor = ref<string>(localStorage.getItem('bgColor') || defaultBGColor);
export const banner = ref<string>(localStorage.getItem('banner') || defaultBanner);
export const storeVisuals = () => {
	localStorage.setItem('bgColor', bgColor.value);
	localStorage.setItem('banner', banner.value);
};
export const getBGColor = (): string => {
	return localStorage.getItem('bgColor') || defaultBGColor;
};
export const getBanner = (): string => {
	return localStorage.getItem('banner') || defaultBanner;
};
export const resetVisuals = () => {
	bgColor.value = defaultBGColor;
	banner.value = defaultBanner;
};
export const rotateBGs = ref<boolean>(false);
export const rotateAnimName = computed<string>(() =>
	rotateBGs.value ? '--bg-anim: bgRotate' : '',
);
export const getBGString = (filename: string) => {
	return "--bg-image: url('" + filename + "'); " + (rotateBGs.value ? '--bg-anim: bgRotate' : '');
};
