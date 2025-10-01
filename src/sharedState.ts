import { ref } from 'vue';

// Action Log
export const actionLog = ref<string>('');
export const updateLog = (text: string) => {
	actionLog.value = text + '\n\n' + actionLog.value;
};
