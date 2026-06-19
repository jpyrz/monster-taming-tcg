# Monster Command TCG Working Guide

This is the working design source of truth for the prototype. The repository name
is `monster-taming-tcg`, but that is not the final game title.

## Core Fantasy

Players are monster tamers in a classic 1v1 battle. Each tamer brings a visible
roster of monsters and a deck of commands, adaptations, tamer tricks, and items.

The key idea is that commands are generic tamer orders. A command like `Rake` is
simple on its own, but each monster interprets that command differently through
its current stance, traits, and adaptations.

## Match Setup

- Each player brings 3 monster cards.
- One monster starts active and two begin on the bench.
- Monster cards are not shuffled into the deck.
- Each player shuffles a deck of non-monster cards.
- Starting hand is 5 cards.
- Each turn starts with 3 Focus.
- Unspent Focus disappears at end of turn.
- Win by knocking out all 3 opposing monsters.

## Turn Structure

1. Draw 1 card.
2. Refresh to 3 Focus.
3. The active monster may switch to any of its stances for free.
4. Play any number of cards as long as their Focus costs can be paid.
5. Commands resolve immediately when played.
6. End the turn.

Whenever a monster enters the active field, its controller chooses its starting
stance. Monster cards do not need a default stance.

When an active monster is knocked out, its owner immediately chooses a benched
monster to become active and chooses that monster's starting stance.

## Card Types

### Monsters

Monster cards define:

- HP
- Speed
- Traits
- Stances
- Adaptation trigger

Monsters are balanced as peer-level choices. Small, cute, huge, rare, or
intimidating monsters should differ by playstyle, not by strict power tier.

### Commands

Command cards are tamer orders. They have tags such as:

- Strike
- Guard
- Move
- Fire
- Claw
- Bite
- Roar
- Focus

Command cards should stay generic by default. Monster-specific command cards can
exist later, but they are not needed for the first prototype.

### Stances

Stances live on monster cards and modify command tags. Commands do not need to
list stance-specific effects.

### Adaptations

Adaptations are lasting changes attached to monsters. They can come from card
play or from monster trigger conditions.

### Tamer Tricks And Items

Tamer tricks and items are support cards that affect commands, damage, stance
changes, conditions, draw, or Focus.

## Example

```text
Cindermane
Monster - Fire, Predator
HP 18
Speed 3

Stances:
Hunting:
Your first Strike command each turn gains +1 Speed.

Frenzy:
Your Strike commands deal +2 damage. After each Strike resolves, Cindermane
takes 1 recoil.

Ashcloak:
Reduce incoming damage by 1. Burn effects applied by Cindermane last +1 turn.

Adaptation Trigger:
After Cindermane takes recoil twice, attach Scorched Nerves:
Your Frenzy recoil is optional once per turn.
```

```text
Rake
Command - Strike, Claw
Cost 1
Deal 3 damage.
```

If Cindermane uses `Rake` in `Hunting`, it deals 3 damage with +1 Speed if it is
the first Strike this turn.

If Cindermane uses `Rake` in `Frenzy`, it deals 5 damage, then Cindermane takes
1 recoil.

If Cindermane uses `Rake` in `Ashcloak`, it deals 3 damage while Ashcloak's
damage reduction remains active.
