<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
	value: number;
	max: number;
	showFill?: boolean;
	inverted?: boolean;
}>();
const realMax = computed<number>(() => props.max);
const realValue = defineModel<number>({ default: 0 });
const textboxValue = ref<number>((props.inverted ? realMax.value - props.value : props.value) || 0);
const displayValue = computed<number>(() => {
	if (props.inverted) {
		return realMax.value - realValue.value || 0;
	} else return realValue.value || 0;
});
const increment = function (amount: number) {
	realValue.value += amount * (props.inverted ? -1 : 1);
};
watch(textboxValue, () => {
	realValue.value = props.inverted
		? realMax.value - (textboxValue.value || 0)
		: textboxValue.value || 0;
});
watch(realValue, () => {
	textboxValue.value = props.inverted ? realMax.value - realValue.value : realValue.value;
});
watch(realMax, () => {
	if (props.inverted) {
		textboxValue.value = realMax.value - realValue.value;
	}
});
</script>
<template>
	<span class="spinbox">
		<input
			class="spinbox-input"
			type="number"
			v-model="textboxValue"
			v-on:focus="textboxValue = displayValue"
			v-on:focusout="textboxValue = displayValue"
		/>
		<!-- <span style="position: absolute; pointer-events: none">{{ realValue }}</span> -->
		<span class="spinbox-increment-container">
			<button
				class="spinbox-increment up"
				@click="increment(1)"
			>
				<span>+</span>
			</button>
			<button
				class="spinbox-increment down"
				@click="increment(-1)"
			>
				<span>-</span>
			</button>
		</span>
	</span>
</template>
<style>
.spinbox {
	display: inline-flex;
	height: 1em;
}
.spinbox-input {
	appearance: textfield;
	width: 0;
	flex-grow: 1;
}
.spinbox-increment-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 1em;
}
.spinbox .spinbox-increment {
	height: 50%;
	width: 1.5em;
	margin: 0;
	font-size: 0.5em;
	position: relative;
	padding: 0;
	border-left: none;
}
.spinbox-increment * {
	position: absolute;
	pointer-events: none;
	top: 0;
	left: 0;
	width: 100%;
}
.spinbox-increment.up {
	border-bottom: none;
}
.spinbox-increment.down {
	border-top: none;
}
</style>
