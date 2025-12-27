<script setup lang="ts">
import { computed, ref } from 'vue';
import useCharacterData, {
	type StatBoxInfo,
	// type BarBoxStatField,
	makeComputedOfStats,
	type CapacityBoxStatField,
	sizeMap,
	type StatsCalculatedKey,
	// type SkillKey,
	// skillsInfoMap,
	elements,
	type Element,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import CapacityBar from '@/components/CapacityBar.vue';
import DGlyph from '@/components/DGlyph.vue';
import { actionLog, updateLog } from '@/sharedState';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const {
	character,
	buffsTallied,
	statsBase,
	stats,
	actionResources,
	getFinalStat,
	statsLoading,
	statsRefresh,
	// skills,
	skillsLoading,
	skillsRefresh,
	weapons,
	weaponAmmoUpdate,
	namesOfEquippedWeapons,
	actionResourceUpdate,
} = useCharacterData(props.characterId);

const subclassColor = computed<string>(() => {
	const subclass = statsBase.value.guardianSubclass as Element;
	return elements[subclass] || '#FFFFFF'; // Kinetic
});
const activeShieldType = computed<Element>(() => {
	const shieldTotals = [
		{ e: 'Kinetic', n: getFinalStat('hpShieldKinetic') },
		{ e: 'Solar', n: getFinalStat('hpShieldSolar') },
		{ e: 'Arc', n: getFinalStat('hpShieldArc') },
		{ e: 'Void', n: getFinalStat('hpShieldVoid') },
		{ e: 'Stasis', n: getFinalStat('hpShieldStasis') },
		{ e: 'Strand', n: getFinalStat('hpShieldStrand') },
		{ e: 'Prismatic', n: getFinalStat('hpShieldPrismatic') },
	].sort((a, b) => b.n - a.n);
	return (shieldTotals[0].e as Element) || 'Kinetic';
});
const shieldColor = computed<string>(() => {
	return elements[activeShieldType.value] || '#FeFFFd';
});
const infoAbilityScores = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Ability Scores', [
		'str',
		'dex',
		'con',
		'int',
		'wis',
		'cha',
	]),
);
const infoDefenseMods = computed<StatBoxInfo>(
	makeComputedOfStats(
		stats,
		buffsTallied,
		'Defense Mods',
		['ac', 'acTouch', 'acFF', 'acFFTouch', 'dr', 'drFF'],
		true,
	),
);
const infoSaves = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Saving Throws', ['fort', 'ref', 'will']),
);
const incrementTurn = () => {
	const source = stats.value;
	const resource = actionResources.value;
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatsCalculatedKey;
		const energyRechargeKey = ('energy' + energy + 'Recharge') as StatsCalculatedKey;
		if (resource[energyKey] < getFinalStat(energyKey) || getFinalStat(energyRechargeKey) < 0) {
			resource[energyKey] += getFinalStat(energyRechargeKey);
		}
	});
	// Action Refresh
	resource.actionsMove += source.actionsMove - resource.actionsMove;
	resource.actionsAttack += source.actionsAttack - resource.actionsAttack;
	resource.actionsReaction += source.actionsReaction - resource.actionsReaction;
	// Healths Regen
	if (resource.health < source.hpMax) {
		resource.health += getFinalStat('hpRegen' as StatsCalculatedKey);
	}
	if (resource.shields < source.hpShieldMax) {
		resource.shields += getFinalStat('hpShieldRegen' as StatsCalculatedKey);
	}
};
const rallyBanner = () => {
	const source = stats.value;
	const resource = actionResources.value;
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatsCalculatedKey;
		resource[energyKey] += source[energyKey] - resource[energyKey];
	});
	// Action Refresh
	resource.actionsMove += source.actionsMove - resource.actionsMove;
	resource.actionsAttack += source.actionsAttack - resource.actionsAttack;
	resource.actionsReaction += source.actionsReaction - resource.actionsReaction;
	// Ammo Refresh
	// resource.ammoKinetic += source.capacityKinetic - resource.ammoKinetic;
	// resource.ammoSpecial += source.capacitySpecial - resource.ammoSpecial;
	// resource.ammoHeavy += source.capacityHeavy - resource.ammoHeavy;
	weapons.value
		.filter((weapon) => namesOfEquippedWeapons.value.includes(weapon.name))
		.forEach((weapon) => {
			weaponAmmoUpdate(weapon.name, weapon.ammoCapacity - weapon.ammoCurrent);
		});
	// Healths Refresh
	resource.health += source.hpMax - resource.health;
	resource.shields += source.hpShieldMax - resource.shields;
};
const healthCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Hit Points',
			stat: 'health',
			max: getFinalStat('hpMax'),
			current: actionResources.value.health,
			color: '#fff',
		},
		{
			label: activeShieldType.value + ' Shields',
			stat: 'shields',
			max: getFinalStat('hpShieldMax'),
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
	const totalDR: number = getFinalStat(drString as StatsCalculatedKey);
	return (
		totalDR + getFinalStat((drString + elementString[dmgType.value]) as StatsCalculatedKey) || 0
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
			max: getFinalStat('actionsMove'),
			current: actionResources.value.actionsMove,
		},
		{
			label: 'Attacks',
			stat: 'actionsAttack',
			max: getFinalStat('actionsAttack'),
			current: actionResources.value.actionsAttack,
		},
		{
			label: 'Reactions',
			stat: 'actionsReaction',
			max: getFinalStat('actionsReaction'),
			current: actionResources.value.actionsReaction,
		},
	];
});
const energyCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Super',
			stat: 'energySuper',
			color: subclassColor.value,
			colorMax: '#ff6',
			max: getFinalStat('energySuper'),
			current: actionResources.value.energySuper,
		},
		{
			label: 'Class',
			stat: 'energyClass',
			color: subclassColor.value,
			max: getFinalStat('energyClass'),
			current: actionResources.value.energyClass,
		},
		{
			label: 'Melee',
			stat: 'energyMelee',
			color: subclassColor.value,
			max: getFinalStat('energyMelee'),
			current: actionResources.value.energyMelee,
		},
		{
			label: 'Grenade',
			stat: 'energyGrenade',
			color: subclassColor.value,
			max: getFinalStat('energyGrenade'),
			current: actionResources.value.energyGrenade,
		},
		{
			label: 'Universal',
			stat: 'energyUniversal',
			color: '#eee',
			max: getFinalStat('energyUniversal'),
			current: actionResources.value.energyUniversal,
		},
	];
});
const encumberanceColor = computed<string>(() => {
	const alpha = getFinalStat('encumberance');
	const colors: Record<number, string> = {
		0: '#fff',
		1: '#ffa',
		2: '#fa6',
		3: '#e76',
	};
	return colors[alpha];
});
</script>
<template>
	<div
		class="CharacterGameplay"
		v-if="character"
	>
		<div v-if="statsLoading || skillsLoading">
			<LoadingModal />
		</div>
		<div v-else>
			<div class="primary-block">
				<div class="action-block">
					<div>
						<h1>{{ character.label }}</h1>
						<button
							@click="
								statsRefresh();
								skillsRefresh();
							"
						>
							Reload Data
						</button>
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
						<StatBarsBox v-bind="infoAbilityScores" />
						<StatBarsBox v-bind="infoSaves" />
						<StatBarsBox v-bind="infoDefenseMods" />
					</div>
					<div class="stat-column-b">
						<StatCapacityBox
							v-bind="{
								label: 'Health',
								data: healthCapacity,
							}"
							:characterId="characterId"
						/>
						<table class="stat-box-table">
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
						/>
						<table>
							<caption>
								<h2>Derived Information</h2>
							</caption>
							<tr :title="buffsTallied.actionsMoveBaseLand?.summary || 'd'">
								<td class="stat-label">Movement per move</td>
								<td class="stat-value">
									{{ getFinalStat('actionsMoveBaseLand') }} ft.
								</td>
							</tr>
							<tr>
								<td class="stat-label">Reach</td>
								<td class="stat-value">{{ getFinalStat('reach') }} ft.</td>
							</tr>
							<tr>
								<td class="stat-label">Size</td>
								<td class="stat-value">{{ sizeMap[getFinalStat('size')].name }}</td>
							</tr>
							<tr>
								<td class="stat-label">Carrying Capacity</td>
								<td class="stat-value">
									{{ getFinalStat('weightCurrent') }} ⁄
									{{ getFinalStat('capacityCarrying') }} lbs.
								</td>
							</tr>
							<tr>
								<td class="stat-label">
									<span v-if="getFinalStat('encumberance') <= 0">
										Not Encumbered
									</span>
									<span v-else-if="getFinalStat('encumberance') === 1">
										Encumbered
									</span>
									<span v-else-if="getFinalStat('encumberance') === 2">
										Heavily Encumbered
									</span>
									<span v-else-if="getFinalStat('encumberance') >= 3">
										Over Encumbered
									</span>
								</td>
								<td>
									<CapacityBar
										v-bind="{
											max: getFinalStat('capacityCarrying'),
											current: getFinalStat('weightCurrent') || 0,
											color: encumberanceColor,
										}"
										style="height: 0.8em"
									/>
								</td>
							</tr>
						</table>
					</div>
					<div class="stat-column-c">
						<div class="ability-block">
							<StatCapacityBox
								v-bind="{
									label: 'Energy',
									data: energyCapacity,
								}"
								:characterId="characterId"
							/>
							<div>
								<button class="ability-button super">Super</button>
								<button class="ability-button melee">Melee</button>
								<button class="ability-button grenade">Grenade</button>
								<button class="ability-button class">Class Ability</button>
							</div>
						</div>
					</div>
				</div>
				<div class="right-block">
					<div class="tab-header">
						<RouterLink
							:to="{ name: 'characterGameplayWeapons', params: { characterId } }"
							>Weapons</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayArmor', params: { characterId } }"
							>Armor</RouterLink
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
			<div class="bottom-block"></div>
		</div>
	</div>
</template>
<style>
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
.tab-header .router-link-active {
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
	width: 12em;
	height: 460px;
}
.action-block button {
	width: 100%;
	height: 2em;
	font-size: 1em;
	margin: 2px 0;
}
.action-log {
	width: 90%;
	height: 100%;
}
/* */
.bottom-block > * {
	margin: 5px;
}
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
