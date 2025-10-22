<script setup lang="ts">
import type { Quest } from '@/composables/useCharacterData';

// import { computed } from 'vue';
// type QuestInfo = {
// 	imageURL: string;
// 	title: string;
// 	description: string;
// 	progress: number;
// 	progressMax: number;
// };
const props = defineProps<Quest>();

const getBarStyle = (value: number, max: number): string => {
	return (
		'background-image: linear-gradient(90deg, #ffff ' +
		(value / max) * 100 +
		'%, #fff6 ' +
		(value / max) * 100 +
		'%);'
	);
};
// const questImage = computed<string>(() => {
// 	if (props.iconURL) {
// 		return props.iconURL;
// 	}
// 	return 'https://destiny.wiki.gallery/images/7/71/Vanguard_elite_daily_bounty1.jpg';
// });
</script>
<template>
	<div class="quest-box">
		<div class="box">
			<img :src="props.iconURL" />
			<h1>{{ props.name }}</h1>
			<p>
				{{ props.description }}
			</p>
		</div>
		<div
			class="bar"
			:style="getBarStyle(props.progressValue || 0, props.progressMax || 0)"
		></div>
	</div>
</template>
<style scoped>
.quest-box {
	max-width: 530px;
	min-height: 132px;
	margin: 0.5em;
	background-image: linear-gradient(#446, #334);
	border: 1px solid #fff4;
	text-align: left;
}
.box {
	display: block;
	padding: 16px;
	max-width: calc((96px * 5) + 18px);
	min-height: 98px;
}
.description {
	width: calc(96px * 4);
	display: inline-block;
	vertical-align: top;
}
h1 {
	font-size: 1.25em;
	font-weight: 800;
	margin: 0.2em 0;
	display: block;
	overflow-x: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
p {
	font-weight: 100;
	margin: 0;
	white-space: pre-line;
}
img {
	float: left;
	background-color: #444;
	border: 1px solid #fff4;
	width: 96px;
	height: 96px;
	/* display: inline-block; */
	margin-right: 16px;
}
.bar {
	background-color: #fff6;
	height: 6px;
	vertical-align: bottom;
}
</style>
