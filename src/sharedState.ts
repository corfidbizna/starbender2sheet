import { ref } from 'vue';

// Action Log
export const actionLog = ref<string>('');
export const updateLog = (text: string) => {
	actionLog.value = text + '\n\n\n' + actionLog.value;
};

// Settings
export const bgColor = ref<string>('#ffffff');
export const banner = ref<string>(
	'https://wallpapershigh.com/wp-content/uploads/destiny-2-logo-5.webp',
);
