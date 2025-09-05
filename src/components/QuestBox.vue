<script setup lang="ts">
// import { computed } from 'vue';
// type QuestInfo = {
// 	imageURL: string;
// 	title: string;
// 	description: string;
// 	progress: number;
// 	progressMax: number;
// };

const getBarStyle = (value: number, max: number): string => {
	return (
		'background-image: linear-gradient(90deg, #ffff ' +
		(value / max) * 100 +
		'%, #fff6 ' +
		(value / max) * 100 +
		'%);'
	);
};
</script>
<template>
	<div class="quest-box">
		<div class="box">
			<img src="https://destiny.wiki.gallery/images/7/71/Vanguard_elite_daily_bounty1.jpg" />
			<div class="description">
				<h1>Quest Name</h1>
				<p>
					The description of the tasks or perhaps something lore-flavor-y goes here.
					Shouldn't be too long. The description of the tasks or perhaps something
					lore-flavor-y goes here. Shouldn't be too long. The description of the tasks or
					perhaps something lore-flavor-y goes here. Shouldn't be too long. The
					description of the tasks or perhaps something lore-flavor-y goes here. Shouldn't
					be too long.
				</p>
			</div>
		</div>
		<div
			class="bar"
			:style="getBarStyle(7, 10)"
		></div>
	</div>
</template>
<style scoped>
.quest-box {
	max-width: 530px;
	height: 140px;
	margin: 0.5em;
	background-image: linear-gradient(#446, #334);
	border: 1px solid #fff4;
	text-align: left;
}
.box {
	display: block;
	padding: 16px;
	max-width: calc((96px * 5) + 18px);
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
}
p {
	font-weight: 100;
	margin: 0;
	max-height: 4em;
	overflow-y: hidden;
	text-overflow: ellipsis;
}
img {
	border: 1px solid #fff4;
	width: 96px;
	height: 96px;
	display: inline-block;
	margin-right: 16px;
}
.bar {
	background-color: #fff6;
	height: 6px;
}
</style>
