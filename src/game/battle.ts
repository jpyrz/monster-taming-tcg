import {
  cards,
  monsters,
  playerDeck,
  playerRoster,
  rivalDeck,
  rivalRoster,
  type CardDefinition,
  type MonsterDefinition,
  type Owner,
  type StanceDefinition,
} from './cards'

export type MonsterInstance = {
  instanceId: string
  monsterId: string
  currentHealth: number
  stanceId: string | null
  recoilTaken: number
  stanceChanges: number
  preventedDamage: number
  adaptations: string[]
}

export type TamerState = {
  activeIndex: number
  deck: string[]
  discard: string[]
  focus: number
  hand: string[]
  roster: MonsterInstance[]
  shield: number
  freeStanceChange: boolean
  usedStrikeThisTurn: boolean
}

export type GamePhase =
  | 'choose-opening-monster'
  | 'choose-opening-stance'
  | 'player-turn'
  | 'player-replace'
  | 'victory'
  | 'defeat'

export type BattleState = {
  current: Owner
  log: string[]
  phase: GamePhase
  player: TamerState
  rival: TamerState
  turn: number
}

const startingFocus = 3
const startingHandSize = 5

function makeRoster(ids: string[], owner: Owner): MonsterInstance[] {
  return ids.map((monsterId, index) => ({
    instanceId: `${owner}-${monsterId}-${index}`,
    monsterId,
    currentHealth: monsters[monsterId].maxHealth,
    stanceId: null,
    recoilTaken: 0,
    stanceChanges: 0,
    preventedDamage: 0,
    adaptations: [],
  }))
}

function drawCards(tamer: TamerState, amount: number): TamerState {
  let deck = [...tamer.deck]
  let hand = [...tamer.hand]

  for (let index = 0; index < amount; index += 1) {
    const next = deck[0]
    if (!next) {
      break
    }
    hand = [...hand, next]
    deck = deck.slice(1)
  }

  return { ...tamer, deck, hand }
}

function makeTamer(rosterIds: string[], deckIds: string[], owner: Owner) {
  return drawCards(
    {
      activeIndex: 0,
      deck: deckIds,
      discard: [],
      focus: startingFocus,
      hand: [],
      roster: makeRoster(rosterIds, owner),
      shield: 0,
      freeStanceChange: true,
      usedStrikeThisTurn: false,
    },
    startingHandSize,
  )
}

export function createInitialBattle(): BattleState {
  const rival = makeTamer(rivalRoster, rivalDeck, 'rival')
  const rivalActive = getActiveMonster(rival)

  return {
    current: 'player',
    phase: 'choose-opening-monster',
    turn: 1,
    player: makeTamer(playerRoster, playerDeck, 'player'),
    rival: {
      ...rival,
      roster: rival.roster.map((monster, index) =>
        index === rival.activeIndex
          ? { ...monster, stanceId: getMonsterDefinition(rivalActive).stances[0].id }
          : monster,
      ),
    },
    log: ['Choose your opening monster. Your roster is ready.'],
  }
}

export function getMonsterDefinition(monster: MonsterInstance) {
  return monsters[monster.monsterId]
}

export function getCardDefinition(cardId: string) {
  return cards[cardId]
}

export function getActiveMonster(tamer: TamerState) {
  return tamer.roster[tamer.activeIndex]
}

export function getActiveMonsterDefinition(tamer: TamerState) {
  return getMonsterDefinition(getActiveMonster(tamer))
}

export function getCurrentStance(monster: MonsterInstance) {
  const definition = getMonsterDefinition(monster)
  return definition.stances.find((stance) => stance.id === monster.stanceId) ?? null
}

export function chooseOpeningMonster(
  state: BattleState,
  rosterIndex: number,
): BattleState {
  if (state.phase !== 'choose-opening-monster') {
    return state
  }

  const monster = state.player.roster[rosterIndex]
  if (!monster || monster.currentHealth <= 0) {
    return state
  }

  return {
    ...state,
    phase: 'choose-opening-stance',
    player: {
      ...state.player,
      activeIndex: rosterIndex,
    },
    log: [
      `${getMonsterDefinition(monster).name} steps onto the field.`,
      ...state.log,
    ],
  }
}

export function chooseOpeningStance(
  state: BattleState,
  stanceId: string,
): BattleState {
  if (state.phase !== 'choose-opening-stance') {
    return state
  }

  const monster = getActiveMonster(state.player)
  if (!isValidStance(monster, stanceId)) {
    return state
  }

  const player = setActiveStance(state.player, stanceId, false)
  return {
    ...state,
    phase: 'player-turn',
    player,
    log: [`${getMonsterDefinition(monster).name} enters in ${stanceName(monster, stanceId)} stance.`, ...state.log],
  }
}

export function switchActiveStance(
  state: BattleState,
  owner: Owner,
  stanceId: string,
): BattleState {
  if (state.phase !== 'player-turn' || owner !== 'player') {
    return state
  }

  const tamer = state[owner]
  const monster = getActiveMonster(tamer)
  if (!tamer.freeStanceChange || !isValidStance(monster, stanceId)) {
    return state
  }

  return {
    ...state,
    [owner]: setActiveStance(tamer, stanceId, true),
    log: [`${getMonsterDefinition(monster).name} shifts to ${stanceName(monster, stanceId)}.`, ...state.log],
  }
}

export function playCard(
  state: BattleState,
  owner: Owner,
  handIndex: number,
): BattleState {
  if (state.phase !== 'player-turn' || owner !== 'player') {
    return state
  }

  const actingTamer = state[owner]
  const cardId = actingTamer.hand[handIndex]
  const card = cards[cardId]
  if (!card || actingTamer.focus < card.cost) {
    return state
  }

  return resolveCard(state, owner, card, handIndex)
}

export function endPlayerTurn(state: BattleState): BattleState {
  if (state.phase !== 'player-turn') {
    return state
  }

  const afterCpu = runRivalTurn({
    ...state,
    current: 'rival',
    log: ['You end your turn.', ...state.log],
    player: {
      ...state.player,
      shield: 0,
    },
  })

  if (afterCpu.phase === 'defeat' || afterCpu.phase === 'player-replace') {
    return afterCpu
  }

  return {
    ...afterCpu,
    current: 'player',
    phase: 'player-turn',
    player: startTurn(afterCpu.player),
    turn: afterCpu.turn + 1,
    log: [`Turn ${afterCpu.turn + 1}. Focus refreshes.`, ...afterCpu.log],
  }
}

export function chooseReplacement(
  state: BattleState,
  rosterIndex: number,
  stanceId: string,
): BattleState {
  if (state.phase !== 'player-replace') {
    return state
  }

  const monster = state.player.roster[rosterIndex]
  if (!monster || monster.currentHealth <= 0 || !isValidStance(monster, stanceId)) {
    return state
  }

  const player = {
    ...state.player,
    activeIndex: rosterIndex,
    roster: state.player.roster.map((candidate, index) =>
      index === rosterIndex ? { ...candidate, stanceId } : candidate,
    ),
  }

  return {
    ...state,
    phase: 'player-turn',
    player: startTurn(player),
    log: [`${getMonsterDefinition(monster).name} takes the field in ${stanceName(monster, stanceId)} stance.`, ...state.log],
  }
}

function resolveCard(
  state: BattleState,
  owner: Owner,
  card: CardDefinition,
  handIndex: number,
) {
  const defenderOwner: Owner = owner === 'player' ? 'rival' : 'player'
  let actingTamer = payAndDiscard(state[owner], card, handIndex)
  let defendingTamer = state[defenderOwner]
  let log = [`${getActiveMonsterDefinition(actingTamer).name} follows ${card.name}.`, ...state.log]

  if (card.type === 'adaptation') {
    actingTamer = attachAdaptation(actingTamer, card.name)
    log = [`${getActiveMonsterDefinition(actingTamer).name} adapts: ${card.name}.`, ...log]
  }

  if (card.guard) {
    const guard = card.guard + getTagAmount(actingTamer, card, 'guardBonus')
    actingTamer = { ...actingTamer, shield: actingTamer.shield + guard }
    log = [`${card.name} prepares ${guard} guard.`, ...log]
  }

  if (card.heal) {
    actingTamer = healActive(actingTamer, card.heal)
    log = [`${getActiveMonsterDefinition(actingTamer).name} heals ${card.heal}.`, ...log]
  }

  if (card.damage) {
    const result = dealCommandDamage(actingTamer, defendingTamer, card)
    actingTamer = result.attacker
    defendingTamer = result.defender
    log = [result.message, ...log]
  }

  if (card.draw) {
    actingTamer = drawCards(actingTamer, card.draw)
    log = [`${card.name} draws ${card.draw}.`, ...log]
  }

  const focusGain = getTagAmount(actingTamer, card, 'focusGain')
  if (focusGain > 0) {
    actingTamer = { ...actingTamer, focus: actingTamer.focus + focusGain }
    log = [`${getActiveMonsterDefinition(actingTamer).name} gains ${focusGain} Focus from stance.`, ...log]
  }

  if (card.tags.includes('Strike')) {
    actingTamer = { ...actingTamer, usedStrikeThisTurn: true }
  }

  const checkedAttacker = checkAdaptationTriggers(actingTamer)
  log = checkedAttacker.messages.length > 0
    ? [...checkedAttacker.messages, ...log]
    : log

  return resolveKnockouts({
    ...state,
    [owner]: checkedAttacker.tamer,
    [defenderOwner]: defendingTamer,
    log,
  })
}

function dealCommandDamage(
  attacker: TamerState,
  defender: TamerState,
  card: CardDefinition,
) {
  const active = getActiveMonster(attacker)
  const definition = getMonsterDefinition(active)
  const speed = definition.speed + getCommandSpeed(attacker, card)
  let damage = card.damage ?? 0
  damage += getTagAmount(attacker, card, 'damageBonus')

  const recoil = getTagAmount(attacker, card, 'recoil')
  const hardenedReduction = getActiveMonster(defender).adaptations.includes('Hardened Scar') ? 1 : 0
  const stanceReduction = getStanceDamageReduction(defender)
  const shieldReduction = Math.min(defender.shield, damage)
  const totalReduction = stanceReduction + hardenedReduction + shieldReduction
  const finalDamage = Math.max(0, damage - totalReduction)

  const nextDefender = damageActive(
    { ...defender, shield: Math.max(0, defender.shield - damage) },
    finalDamage,
  )
  let nextAttacker = attacker

  if (recoil > 0) {
    const hasScorchedNerves = active.adaptations.includes('Scorched Nerves')
    const actualRecoil = hasScorchedNerves ? 0 : recoil
    nextAttacker = damageActive(attacker, actualRecoil, true)
  }

  return {
    attacker: nextAttacker,
    defender: nextDefender,
    message: `${definition.name} resolves ${card.name} at Speed ${speed} for ${finalDamage} damage.`,
  }
}

function runRivalTurn(state: BattleState): BattleState {
  let rival = startTurn(state.rival)
  let nextState: BattleState = {
    ...state,
    rival,
    log: ['Rival takes the turn.', ...state.log],
  }

  const active = getActiveMonster(rival)
  if (!active.stanceId) {
    const firstStance = getMonsterDefinition(active).stances[0].id
    rival = setActiveStance(rival, firstStance, false)
    nextState = { ...nextState, rival }
  }

  const handIndex = rival.hand.findIndex((cardId) => {
    const card = cards[cardId]
    return card.cost <= rival.focus && card.type === 'command'
  })

  if (handIndex >= 0) {
    nextState = resolveCard(nextState, 'rival', cards[rival.hand[handIndex]], handIndex)
  }

  return {
    ...nextState,
    rival: {
      ...nextState.rival,
      shield: 0,
    },
  }
}

function startTurn(tamer: TamerState): TamerState {
  return drawCards(
    {
      ...tamer,
      focus: startingFocus,
      freeStanceChange: true,
      shield: 0,
      usedStrikeThisTurn: false,
    },
    1,
  )
}

function payAndDiscard(tamer: TamerState, card: CardDefinition, handIndex: number) {
  return {
    ...tamer,
    discard: [...tamer.discard, card.id],
    focus: tamer.focus - card.cost,
    hand: tamer.hand.filter((_, index) => index !== handIndex),
  }
}

function setActiveStance(
  tamer: TamerState,
  stanceId: string,
  countAsChange: boolean,
): TamerState {
  return {
    ...tamer,
    freeStanceChange: countAsChange ? false : tamer.freeStanceChange,
    roster: tamer.roster.map((monster, index) =>
      index === tamer.activeIndex
        ? {
            ...monster,
            stanceId,
            stanceChanges: countAsChange
              ? monster.stanceChanges + 1
              : monster.stanceChanges,
          }
        : monster,
    ),
  }
}

function attachAdaptation(tamer: TamerState, adaptation: string): TamerState {
  const active = getActiveMonster(tamer)
  if (active.adaptations.includes(adaptation)) {
    return tamer
  }

  return {
    ...tamer,
    roster: tamer.roster.map((monster, index) =>
      index === tamer.activeIndex
        ? { ...monster, adaptations: [...monster.adaptations, adaptation] }
        : monster,
    ),
  }
}

function healActive(tamer: TamerState, amount: number): TamerState {
  const active = getActiveMonster(tamer)
  const definition = getMonsterDefinition(active)

  return {
    ...tamer,
    roster: tamer.roster.map((monster, index) =>
      index === tamer.activeIndex
        ? {
            ...monster,
            currentHealth: Math.min(definition.maxHealth, monster.currentHealth + amount),
          }
        : monster,
    ),
  }
}

function damageActive(
  tamer: TamerState,
  amount: number,
  isRecoil = false,
): TamerState {
  if (amount <= 0) {
    return tamer
  }

  return {
    ...tamer,
    roster: tamer.roster.map((monster, index) =>
      index === tamer.activeIndex
        ? {
            ...monster,
            currentHealth: Math.max(0, monster.currentHealth - amount),
            recoilTaken: isRecoil ? monster.recoilTaken + amount : monster.recoilTaken,
          }
        : monster,
    ),
  }
}

function checkAdaptationTriggers(tamer: TamerState) {
  const active = getActiveMonster(tamer)
  const definition = getMonsterDefinition(active)
  const messages: string[] = []
  let nextTamer = tamer

  if (
    definition.id === 'cindermane' &&
    active.recoilTaken >= 2 &&
    !active.adaptations.includes('Scorched Nerves')
  ) {
    nextTamer = attachAdaptation(nextTamer, 'Scorched Nerves')
    messages.push('Cindermane adapts: Scorched Nerves.')
  }

  if (
    definition.id === 'emberwhelp' &&
    active.stanceChanges >= 3 &&
    !active.adaptations.includes('Quickened Heart')
  ) {
    nextTamer = attachAdaptation(nextTamer, 'Quickened Heart')
    messages.push('Ember Whelp adapts: Quickened Heart.')
  }

  return { tamer: nextTamer, messages }
}

function resolveKnockouts(state: BattleState): BattleState {
  const playerActive = getActiveMonster(state.player)
  const rivalActive = getActiveMonster(state.rival)

  if (rivalActive.currentHealth <= 0) {
    const nextIndex = state.rival.roster.findIndex(
      (monster, index) => index !== state.rival.activeIndex && monster.currentHealth > 0,
    )

    if (nextIndex === -1) {
      return {
        ...state,
        phase: 'victory',
        log: ['Victory. The rival roster is defeated.', ...state.log],
      }
    }

    const replacement = state.rival.roster[nextIndex]
    const stanceId = getMonsterDefinition(replacement).stances[0].id
    return {
      ...state,
      rival: {
        ...state.rival,
        activeIndex: nextIndex,
        roster: state.rival.roster.map((monster, index) =>
          index === nextIndex ? { ...monster, stanceId } : monster,
        ),
      },
      log: [`Rival sends out ${getMonsterDefinition(replacement).name}.`, ...state.log],
    }
  }

  if (playerActive.currentHealth <= 0) {
    const hasReplacement = state.player.roster.some(
      (monster, index) => index !== state.player.activeIndex && monster.currentHealth > 0,
    )

    if (!hasReplacement) {
      return {
        ...state,
        phase: 'defeat',
        log: ['Defeat. Your roster is defeated.', ...state.log],
      }
    }

    return {
      ...state,
      phase: 'player-replace',
      log: [`${getMonsterDefinition(playerActive).name} is knocked out. Choose a replacement.`, ...state.log],
    }
  }

  return state
}

function getCommandSpeed(tamer: TamerState, card: CardDefinition) {
  const stance = getCurrentStance(getActiveMonster(tamer))
  if (!stance) {
    return 0
  }

  return stance.effects.reduce((total, effect) => {
    if (
      effect.kind === 'speedBonus' &&
      card.tags.includes(effect.tag) &&
      (!effect.firstOnly || !tamer.usedStrikeThisTurn)
    ) {
      return total + effect.amount
    }

    return total
  }, 0)
}

function getTagAmount(
  tamer: TamerState,
  card: CardDefinition,
  kind: 'damageBonus' | 'focusGain' | 'guardBonus' | 'recoil',
) {
  const stance = getCurrentStance(getActiveMonster(tamer))
  if (!stance) {
    return 0
  }

  return stance.effects.reduce((total, effect) => {
    if (effect.kind === kind && card.tags.includes(effect.tag)) {
      return total + effect.amount
    }

    return total
  }, 0)
}

function getStanceDamageReduction(tamer: TamerState) {
  const stance = getCurrentStance(getActiveMonster(tamer))
  if (!stance) {
    return 0
  }

  return stance.effects.reduce((total, effect) => {
    if (effect.kind === 'damageReduction') {
      return total + effect.amount
    }

    return total
  }, 0)
}

function isValidStance(monster: MonsterInstance, stanceId: string) {
  return getMonsterDefinition(monster).stances.some((stance) => stance.id === stanceId)
}

function stanceName(monster: MonsterInstance, stanceId: string) {
  return (
    getMonsterDefinition(monster).stances.find((stance) => stance.id === stanceId)
      ?.name ?? stanceId
  )
}

export function getAvailableReplacementOptions(state: BattleState) {
  return state.player.roster
    .map((monster, index) => ({ index, monster, definition: getMonsterDefinition(monster) }))
    .filter(
      (option) =>
        option.index !== state.player.activeIndex && option.monster.currentHealth > 0,
    )
}

export function getStanceLabel(stance: StanceDefinition) {
  return stance.name
}

export function getMonsterLabel(monster: MonsterDefinition) {
  return `${monster.name} - ${monster.traits.join(', ')}`
}
