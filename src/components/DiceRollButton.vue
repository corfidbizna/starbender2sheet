<script setup lang="ts">
import type { Stats } from '@/business_logic/buffs';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
import { updateLog } from '@/sharedState';

/**
 *  A standardized button for rolling dice and communicating the results to the log.
 */
const props = defineProps<{
	/**
	 * The label to be used for display on the log.
	 */
	labelLog: string;
	/**
	 * The label to be used for the button. Can be blank.
	 */
	labelButton?: string;
	/**
	 * A number or a `DiceFormula` to roll.
	 * Numbers will be automatically rolled alongside a d20 and have its value added to the result, whereas a `DiceFormula` will be rolled as-is.
	 * If specifying a `DiceFormula` and the formula includes references to stat names, please also include a copy of the stats to roll with.
	 */
	formula: DiceFormula | number;
	/**
	 * A copy of the stats to use when rolling a dice if the formula is a `DiceFormula`.
	 * If the specified formual is a `DiceFormula` but no stats are provided, all stats are assumed to be zero.
	 */
	stats?: Stats;
	/**
	 * Whether or not the button should currently be disabled.
	 */
	disabled?: boolean;
}>();
const blankRollFunction = () => 0;
const statFunction =
	props.stats === undefined ? blankRollFunction : getStatByCharacter(props.stats);
const roll = () => {
	let resultString = props.labelLog + ':\n';
	let dieResult;
	if (props.formula instanceof DiceFormula) {
		dieResult = props.formula.roll(statFunction);
		resultString += '' + props.formula.stringify() + ' ⇒ ' + dieResult;
	} else {
		dieResult = new DiceFormula('1d20').roll(blankRollFunction);
		resultString +=
			'' + dieResult + ' + ' + props.formula + ' bonus ⇒ ' + (dieResult + props.formula);
		if (dieResult === 1) resultString += '\n == Natural 1! ==';
		if (dieResult === 20) resultString += '\n == Natural 20! ==';
	}
	updateLog(resultString);
};
</script>
<template>
	<button
		class="dice-roll-button"
		@click="roll"
		:disabled="disabled"
	>
		{{ labelButton }}
	</button>
</template>
<style>
.dice-roll-button {
	text-align: center;
}
</style>
