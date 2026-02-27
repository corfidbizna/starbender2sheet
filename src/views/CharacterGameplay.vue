<script setup lang="ts">
import { computed, ref } from 'vue';
import useCharacterData, {
	type StatBoxInfo,
	makeComputedOfStats,
	type CapacityBoxStatField,
	sizeMap,
	type StatName,
	elements,
	type Element,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import CapacityBar from '@/components/CapacityBar.vue';
import DGlyph from '@/components/DGlyph.vue';
import { actionLog, getBGString, updateLog } from '@/sharedState';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const {
	character,
	buffsTallied,
	stats,
	statsBuffed,
	actionResources,
	statsLoading,
	statsRefresh,
	skillsLoading,
	skillsRefresh,
	weapons,
	weaponAmmoUpdate,
	actionResourceUpdate,
} = useCharacterData(props.characterId);

const activeShieldType = computed<Element>(() => {
	const shieldTotals = [
		{ e: 'Kinetic', n: statsBuffed.value['hpShieldKinetic'].total },
		{ e: 'Solar', n: statsBuffed.value['hpShieldSolar'].total },
		{ e: 'Arc', n: statsBuffed.value['hpShieldArc'].total },
		{ e: 'Void', n: statsBuffed.value['hpShieldVoid'].total },
		{ e: 'Stasis', n: statsBuffed.value['hpShieldStasis'].total },
		{ e: 'Strand', n: statsBuffed.value['hpShieldStrand'].total },
		{ e: 'Prismatic', n: statsBuffed.value['hpShieldPrismatic'].total },
	].sort((a, b) => b.n - a.n);
	return (shieldTotals[0].e as Element) || 'Kinetic';
});
const shieldColor = computed<string>(() => {
	return elements[activeShieldType.value] || '#FeFFFd';
});
// const infoAbilityScores = computed<StatBoxInfo>(
// 	makeComputedOfStats(stats, buffsTallied, 'Ability Scores', [
// 		'str',
// 		'dex',
// 		'con',
// 		'int',
// 		'wis',
// 		'cha',
// 	]),
// );
const infoAbilityScores = computed<StatBoxInfo>(() => {
	const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
	return {
		label: 'Ability Scores',
		data: keys.map((key, i) => ({
			key,
			label:
				keys[i].toLocaleUpperCase() +
				' ' +
				statsBuffed.value[(keys[i] + 'Score') as StatName].total,
			stat: key,
			hovertext: statsBuffed.value[key as StatName].summary.join('\n'),
			value: stats.value[key as StatName].total,
			value2: statsBuffed.value[key as StatName].total,
		})),
		noRoll: false,
	};
});
const infoDefenseMods = computed<StatBoxInfo>(
	makeComputedOfStats(
		stats,
		statsBuffed,
		'Defense Mods',
		['ac', 'acTouch', 'acFF', 'acFFTouch', 'dr', 'drFF'],
		true,
	),
);
const expendables = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Rerolls',
			stat: 'rerolls',
			max: statsBuffed.value.rerolls.total,
			current: actionResources.value.rerolls,
			color: '#fff',
		},
		{
			label: 'Charges',
			stat: 'armorCharges',
			color: '#8df',
			max: statsBuffed.value.capacityArmorCharge.total,
			current: actionResources.value.armorCharges,
		},
	];
});
const infoSaves = computed<StatBoxInfo>(
	makeComputedOfStats(stats, statsBuffed, 'Saving Throws', ['fort', 'ref', 'will']),
);
const incrementTurn = () => {
	const source = stats.value;
	const resource = actionResources.value;
	// Update Log
	updateLog('—— Turn ' + actionResources.value.turns + ' Ended ——');
	// Turn Counter
	actionResourceUpdate('turns', 1);
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatName;
		const energyRechargeKey = ('energy' + energy + 'Recharge') as StatName;
		if (
			resource[energyKey] < statsBuffed.value[energyKey].total ||
			statsBuffed.value[energyRechargeKey].total < 0
		) {
			resource[energyKey] += statsBuffed.value[energyRechargeKey].total;
		}
	});
	// Action Refresh
	resource.actionsMove += source.actionsMove.total - resource.actionsMove;
	resource.actionsAttack += source.actionsAttack.total - resource.actionsAttack;
	resource.actionsReaction += source.actionsReaction.total - resource.actionsReaction;
	// Healths Regen
	if (resource.health < source.hpMax.total) {
		resource.health += statsBuffed.value.hpRecharge.total;
	}
	if (resource.shields < source.hpShieldMax.total) {
		resource.shields += statsBuffed.value.hpShieldRecharge.total;
	}
};
const rallyBanner = () => {
	const resource = actionResources.value;
	// Update Log
	updateLog('    Rallying to a banner!\nAll energies and health refilled');
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatName;
		resource[energyKey] += statsBuffed.value[energyKey].total - resource[energyKey];
	});
	// Action Refresh
	resource.actionsMove += statsBuffed.value.actionsMove.total - resource.actionsMove;
	resource.actionsAttack += statsBuffed.value.actionsAttack.total - resource.actionsAttack;
	resource.actionsReaction += statsBuffed.value.actionsReaction.total - resource.actionsReaction;
	// Ammo Refresh
	// resource.ammoKinetic += source.capacityKinetic - resource.ammoKinetic;
	// resource.ammoSpecial += source.capacitySpecial - resource.ammoSpecial;
	// resource.ammoHeavy += source.capacityHeavy - resource.ammoHeavy;
	weapons.value
		.filter((weapon) => weapon.isEquipped)
		.forEach((weapon) => {
			weaponAmmoUpdate(weapon.name, weapon.ammoCapacity - weapon.ammoCurrent);
		});
	// Healths Refresh
	resource.health += statsBuffed.value.hpMax.total - resource.health;
	resource.shields += statsBuffed.value.hpShieldMax.total - resource.shields;
};
const healthCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Hit Points',
			stat: 'health',
			max: statsBuffed.value.hpMax.total,
			current: actionResources.value.health,
			color: '#fff',
		},
		{
			label: activeShieldType.value + ' Shields',
			stat: 'shields',
			max: statsBuffed.value.hpShieldMax.total,
			current: actionResources.value.shields,
			color: shieldColor.value,
		},
	];
});

const dmg = ref(0);
const dmgMult = ref(1);
const dmgCount = ref(1);
const dmgType = ref('Kinetic');
const dmgDRType = ref('DR');
const currentDR = computed<number>(() => {
	if (dmgDRType.value === 'None') {
		return 0;
	}
	const stringMid = dmgDRType.value.includes('FF') ? 'FF' : '';
	const drString = 'dr' + stringMid;
	const elementString: Record<string, string> = {
		Solar: 'Solar',
		Arc: 'Arc',
		Void: 'Void',
		Stasis: 'Stasis',
		Strand: 'Strand',
		Prismatic: 'Prismatic',
		Dark: 'Dark',
		Darkness: 'Dark',
	};
	const totalDR: number = statsBuffed.value[drString as StatName].total || 0;
	return (
		totalDR +
		(statsBuffed.value[(drString + elementString[dmgType.value]) as StatName]?.total || 0)
	);
});
const currentDamage = computed<number>(() => {
	return Math.max(0, (dmg.value * dmgMult.value - currentDR.value) * dmgCount.value);
});
const previewDamage = computed<Record<string, number>>(() => {
	const result = {
		health: actionResources.value.health,
		shields: actionResources.value.shields,
	};
	if (result.shields <= 0) {
		// If there are no shields, just subtract the damage from the health and be done.
		result.health -= Math.floor(currentDamage.value);
	} else {
		const isWeak = dmgType.value === activeShieldType.value;
		let damage = currentDamage.value;
		damage = isWeak ? damage * 2 : damage / 2;
		result.shields -= damage;
		if (result.shields < 0) {
			// If the shields couldn't completely take the hit….
			damage = result.shields;
			result.health = Math.floor(result.health + (isWeak ? damage / 2 : damage * 2));
		}
		result.shields = Math.max(0, Math.floor(result.shields));
	}
	return result;
});
const glyphMap: Record<string, string> = {
	Kinetic: '',
	Solar: '',
	Arc: '',
	Void: '',
	Stasis: '',
	Strand: '',
	Prismatic: '',
	Dark: '',
	Darkness: '',
};
const applyDamage = () => {
	const startingHealth = actionResources.value.health;
	const startingShields = actionResources.value.shields;
	//
	const diffHealth = -1 * (startingHealth - previewDamage.value.health);
	const diffShields = -1 * (startingShields - previewDamage.value.shields);
	const stringStart = 'Took ' + glyphMap[dmgType.value] + dmg.value + ' damage,\n  ';
	const stringShield =
		'Shields: ' +
		startingShields +
		' → ' +
		previewDamage.value.shields +
		' (' +
		diffShields +
		')\n  ';
	const stringHealth =
		'Health:  ' + startingHealth + ' → ' + previewDamage.value.health + ' (' + diffHealth + ')';
	updateLog(stringStart + (startingShields > 0 ? stringShield : '') + stringHealth);
	if (actionResources.value.health <= 0) {
		updateLog('== Guardian down! ==');
	}
	//
	actionResourceUpdate('health', previewDamage.value.health - actionResources.value.health);
	actionResourceUpdate('shields', previewDamage.value.shields - actionResources.value.shields);
};

const actionsCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Moves',
			stat: 'actionsMove',
			max: statsBuffed.value.actionsMove.total,
			current: actionResources.value.actionsMove,
		},
		{
			label: 'Attacks',
			stat: 'actionsAttack',
			max: statsBuffed.value.actionsAttack.total,
			current: actionResources.value.actionsAttack,
		},
		{
			label: 'Reactions',
			stat: 'actionsReaction',
			max: statsBuffed.value.actionsReaction.total,
			current: actionResources.value.actionsReaction,
		},
		{
			label: 'Bonus Actions',
			stat: 'actionsBonus',
			max: statsBuffed.value.actionsBonus.total,
			current: actionResources.value.actionsBonus,
		},
	];
});

const encumberanceTEMP = computed<number>(() => {
	return Math.trunc(
		Math.max(
			0,
			Math.min(
				3,
				(statsBuffed.value.weightCurrent.total / statsBuffed.value.capacityCarrying.total) *
					3,
			),
		),
	);
});
const encumberanceColor = computed<string>(() => {
	// Right now 'encumberance' is broken, so I'm reusing the math for encumberanceTEMP.
	const colors: Record<number, string> = {
		0: '#fff',
		1: '#ffa',
		2: '#fa6',
		3: '#e76',
	};
	return colors[encumberanceTEMP.value];
});
</script>
<template>
	<div
		class="CharacterGameplay"
		v-if="character"
	>
		<div
			class="rotating-bg"
			:style="getBGString('../svgs/Lines_Traveler.svg')"
		></div>
		<div v-if="statsLoading || skillsLoading">
			<LoadingModal />
		</div>
		<div v-else>
			<div class="primary-block">
				<div class="action-block">
					<div>
						<button
							@click="
								statsRefresh();
								skillsRefresh();
							"
						>
							Reload Data
						</button>
						<h1 class="turn-display">
							<span style="flex: 1 0 auto">Turn </span
							><span style="margin-left: auto; flex: 1 0 auto"
								><input
									style="font-size: 0.8em; width: 2em"
									v-model="actionResources['turns']"
									type="number"
									min="0"
									value="1"
							/></span>
						</h1>
						<button @click="incrementTurn">Increment Turn</button>
						<button @click="rallyBanner">Rally Banner</button>
					</div>
					<h2>Action Log</h2>
					<textarea
						v-model="actionLog"
						readonly
						class="action-log"
					></textarea>
				</div>
				<div class="left-block">
					<div class="stat-column-a">
						<StatBarsBox
							v-bind="infoAbilityScores"
							class="hover-highlight"
						/>
						<StatBarsBox
							v-bind="infoSaves"
							class="hover-highlight"
						/>
						<StatBarsBox
							v-bind="infoDefenseMods"
							class="hover-highlight"
						/>
						<StatCapacityBox
							v-bind="{ label: 'Expendables', data: expendables }"
							:characterId="characterId"
							class="hover-highlight"
							style="margin: 0.5em"
						/>
					</div>
					<div class="stat-column-b">
						<StatCapacityBox
							v-bind="{
								label: 'Health',
								data: healthCapacity,
							}"
							:characterId="characterId"
							class="hover-highlight"
						/>
						<table class="stat-box-table hover-highlight">
							<caption>
								<h2>
									<span>Damage Calculator</span
									><button
										style="float: right"
										@click="applyDamage"
									>
										Apply
									</button>
								</h2>
							</caption>
							<tr>
								<td class="stat-label">Math</td>
								<td
									class="stat-value"
									colspan="3"
								>
									({{ dmg }} × {{ dmgMult }}){{ currentDR < 0 ? ' + ' : ' - '
									}}{{ Math.abs(currentDR) }} → {{ dmgCount }}× →
								</td>
								<td
									class="stat-value"
									style="text-align: right"
								>
									<span>{{ currentDamage }}</span>
								</td>
							</tr>
							<tr>
								<td class="stat-label">Received</td>
								<td
									class="stat-value"
									colspan="4"
								>
									<input
										id="damage-raw"
										type="number"
										value="0"
										v-model="dmg"
										style="min-width: 4em; width: 40%"
									/>
								</td>
							</tr>
							<tr>
								<td class="stat-label">Mult</td>
								<td class="stat-value">
									<input
										id="damage-mult"
										type="number"
										value="1"
										min="0"
										v-model="dmgMult"
										style="width: 3em"
									/>
								</td>
								<td class="stat-label">Type</td>
								<td class="stat-value">
									<select
										name="damage-select"
										id="damage-select"
										v-model="dmgType"
										style="width: 100%"
									>
										<option
											v-for="element in Object.keys(elements)"
											:key="element"
											:value="element"
										>
											{{ element }}
										</option>
										<option value="Darkness">Darkness</option>
									</select>
								</td>
								<td>
									<DGlyph
										v-if="dmgType !== 'Kinetic'"
										v-bind="{ name: dmgType }"
										class="element-glyph"
										:style="
											'color: ' + (elements[dmgType as Element] || '#7a6666')
										"
										style="font-size: 1em"
									/>
								</td>
							</tr>
							<tr>
								<td class="stat-label">Count</td>
								<td class="stat-value">
									<input
										id="damage-count"
										type="number"
										value="1"
										min="1"
										v-model="dmgCount"
										style="width: 3em"
									/>
								</td>
								<td class="stat-label">DR</td>
								<td class="stat-value">
									<select
										name="damage-select"
										id="damage-select"
										v-model="dmgDRType"
									>
										<option value="None">--None--</option>
										<option value="DR">DR</option>
										<option value="FFDR">FFDR</option>
									</select>
								</td>
								<td class="stat-value">
									{{ currentDR }}
								</td>
							</tr>
						</table>
						<StatCapacityBox
							v-bind="{
								label: 'Actions',
								data: actionsCapacity,
							}"
							:characterId="characterId"
							class="hover-highlight"
						/>
						<table class="hover-highlight">
							<caption>
								<h2>Derived Information</h2>
							</caption>
							<tr :title="buffsTallied.actionsMoveBaseLand.summary.join('\n') || ''">
								<td class="stat-label">Movement per move</td>
								<td class="stat-value">
									{{ statsBuffed['actionsMoveBaseLand'].total }} ft.
								</td>
							</tr>
							<tr>
								<td class="stat-label">Reach</td>
								<td class="stat-value">{{ statsBuffed['reach'].total }} ft.</td>
							</tr>
							<tr>
								<td class="stat-label">Size</td>
								<td class="stat-value">
									{{ sizeMap[statsBuffed['size'].total].name }}
								</td>
							</tr>
							<tr>
								<td class="stat-label">Carrying Capacity</td>
								<td class="stat-value">
									{{ statsBuffed['weightCurrent'].total }} ⁄
									{{ statsBuffed['capacityCarrying'].total }} lbs.
								</td>
							</tr>
							<tr>
								<td class="stat-label">
									<span v-if="encumberanceTEMP <= 0"> Not Encumbered </span>
									<span v-else-if="encumberanceTEMP === 1"> Encumbered </span>
									<span v-else-if="encumberanceTEMP === 2">
										Heavily Encumbered
									</span>
									<span v-else-if="encumberanceTEMP >= 3"> Over Encumbered </span>
								</td>
								<td>
									<CapacityBar
										v-bind="{
											max: statsBuffed.capacityCarrying.total,
											current: statsBuffed.weightCurrent.total || 0,
											color: encumberanceColor,
										}"
										style="height: 0.8em"
									/>
								</td>
							</tr>
						</table>
					</div>
					<!-- <div class="stat-column-c">
						<div class="ability-block">nothing here</div>
					</div> -->
				</div>
				<div class="right-block">
					<div class="tab-header">
						<RouterLink :to="{ name: 'characterGameplay', params: { characterId } }"
							>Weapons</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayArmor', params: { characterId } }"
							>Armor</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayAbilities', params: { characterId } }"
							>Abilities</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplaySkills', params: { characterId } }"
							>Skills</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayBuffs', params: { characterId } }"
							>Buffs</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayArtifact', params: { characterId } }"
							>Artifact</RouterLink
						>
					</div>
					<RouterView />
				</div>
			</div>
		</div>
	</div>
</template>
<style>
.turn-display {
	display: flex;
	align-items: baseline;
	padding: 10px 20px;
	border-top: 2px solid #ddd;
	border-bottom: 2px solid #ddd;
	margin: 8px 0;
}
.hover-highlight {
	/* color: #e8e8e8; */
	transition: color 0.5s;
}
.hover-highlight:hover {
	color: #fff;
	transition: color 0.5s;
}
.stat-label {
	text-align: right;
	white-space: nowrap;
}
.stat-value {
	text-align: left;
	padding-left: 0.25em;
	white-space: nowrap;
	font-weight: bold;
	width: 100%;
}
/* */
.primary-block {
	height: var(--content-height);
	width: 100%;
	max-width: 1400px;
	margin: 0 auto;
	display: inline-block;
	vertical-align: top;
	display: flex;
}
.left-block {
	flex: 1 1 auto;
}
.right-block {
	flex: 0 0 auto;
	width: 500px;
}
.stat-column-a,
.stat-column-b,
.stat-column-c {
	display: inline-block;
	vertical-align: top;
	margin: 0.6%;
}
.stat-column-a {
	width: 43%;
}
.stat-column-b {
	width: 53%;
}
.stat-column-c {
	width: 98%;
}
.tab-header {
	width: 100%;
	display: flex;
}
.tab-header * {
	flex: 1 0;
	border: 1px solid #fffd;
	background-color: #0002;
	text-align: center;
	text-transform: uppercase;
	text-decoration: none;
	padding: 0.5em;
	transition:
		color 0.1s,
		background-color 0.1s;
	color: #fffb;
	margin-top: 1em;
}
.tab-header a:hover {
	transition:
		color 0.1s,
		background-color 0.1s;
	color: #fff;
	background-color: #fff1;
}
.tab-header .router-link-exact-active {
	color: #ffff;
	background-color: #fff4;
}
/* */
.secondary-block {
	width: 500px;
	display: inline-block;
	vertical-align: top;
}
.action-block {
	flex: 0 0 auto;
	display: flex;
	width: 12em;
	height: var(--content-height);
	flex-direction: column;
}
.action-block button {
	width: 100%;
	height: 2em;
	font-size: 1em;
	margin: 2px 0;
}
.action-log {
	width: auto;
	flex-grow: 2;
}
/* */
.weapon-block {
	display: block;
}
.ability-block {
	display: block;
	padding: 0 2em;
}
.ability-button {
	width: 25%;
}
</style>
