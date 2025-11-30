# Patch - Corrections Blackjack automatique et continuité du sabot

## 🐛 Problèmes identifiés

### **Problème 1 : Blackjack ne passe pas automatiquement**
- **Symptôme** : Timer continue même avec un Blackjack naturel
- **Cause** : `setTurn()` définit toujours un timer, même pour les Blackjacks
- **Impact** : Le joueur doit attendre la fin du timer au lieu de passer automatiquement

### **Problème 2 : "Nouvelle main" vide le sabot**
- **Symptôme** : Après "Nouvelle main", plus aucune carte visible
- **Cause** : `newHand()` ne redémarre pas automatiquement la distribution
- **Impact** : Pas de continuité du sabot comme dans un vrai casino

## ✅ Corrections apportées

### 1. **Blackjack automatique** - `setTurn()`
**Fichier** : `store/useShoe.ts`  
**Ligne** : ~720

**AVANT** :
```tsx
setTurn: (turn) => {
  const { ui } = get()
  const deadline = turn ? Date.now() + ui.turnSeconds * 1000 : undefined
  set({ currentTurn: turn, turnDeadlineAt: deadline })
},
```

**APRÈS** :
```tsx
setTurn: (turn) => {
  const { ui } = get()
  
  // Vérifier si la main actuelle est un Blackjack
  let shouldSetTimer = true
  if (turn) {
    const seat = get().seats[turn.seatIndex]
    const hand = seat.hands[turn.handIndex]
    if (hand.blackjack) {
      shouldSetTimer = false
      get().addEvent(`Blackjack automatique - Siège ${turn.seatIndex + 1} passe`)
      // Avancer automatiquement après un court délai
      setTimeout(() => {
        get().advanceTurn()
      }, 1000)
    }
  }
  
  const deadline = turn && shouldSetTimer ? Date.now() + ui.turnSeconds * 1000 : undefined
  set({ currentTurn: turn, turnDeadlineAt: deadline })
},
```

### 2. **Continuité du sabot** - `newHand()`
**Fichier** : `store/useShoe.ts`  
**Ligne** : ~1200

**AVANT** :
```tsx
newHand: () => {
  // IMPORTANT: Ne réinitialise que roundState, pas shoeState
  get().resetRoundState()
},
```

**APRÈS** :
```tsx
newHand: () => {
  // IMPORTANT: Ne réinitialise que roundState, pas shoeState
  get().resetRoundState()
  
  // Vérifier si on doit reshuffle (cut card atteinte)
  const state = get()
  if (state.shoe.length <= state.cutCardPosition) {
    get().addEvent("Cut card atteinte - Reshuffle automatique")
    get().initShoe()
  }
  
  // Démarrer automatiquement la nouvelle main
  setTimeout(() => {
    get().startRound()
  }, 500)
},
```

### 3. **Gestion des Blackjacks dans `advanceTurn()`**
**Fichier** : `store/useShoe.ts`  
**Ligne** : ~1080

**AJOUT** :
```tsx
// Si c'est un Blackjack, le marquer comme terminé et passer au suivant
if (hand.blackjack && !hand.finished) {
  hand.finished = true
  get().addEvent(`Blackjack automatique - Siège ${nextSeatIndex + 1} passe`)
}
```

## 🎯 Résultat

### ✅ Blackjack automatique
- **Timer désactivé** pour les Blackjacks naturels
- **Passage automatique** après 1 seconde
- **Événement loggé** : "Blackjack automatique - Siège X passe"
- **UX fluide** : Plus d'attente inutile

### ✅ Continuité du sabot
- **"Nouvelle main"** redémarre automatiquement la distribution
- **Cut card** vérifiée et reshuffle automatique si nécessaire
- **Sabot persistant** : Les cartes restent dans le même sabot
- **Comptage préservé** : Running count et true count maintenus

### ✅ Comportement casino réaliste
- **Distribution séquentielle** maintenue
- **Reshuffle automatique** quand nécessaire
- **Transition fluide** entre les mains
- **Pas de perte de contexte** du sabot

## 🧪 Tests recommandés

1. **Blackjack automatique** :
   - Obtenir un Blackjack naturel
   - Vérifier que le timer ne s'affiche pas
   - Confirmer le passage automatique après 1s

2. **Continuité du sabot** :
   - Jouer plusieurs mains avec "Nouvelle main"
   - Vérifier que les cartes diminuent progressivement
   - Confirmer que le comptage persiste

3. **Reshuffle automatique** :
   - Jouer jusqu'à la cut card
   - Vérifier le reshuffle automatique
   - Confirmer la réinitialisation du comptage

## 📋 Checklist de validation

- [ ] Blackjack naturel → passage automatique (pas de timer)
- [ ] "Nouvelle main" → distribution automatique
- [ ] Sabot persistant entre les mains
- [ ] Cut card → reshuffle automatique
- [ ] Comptage préservé (sauf après reshuffle)
- [ ] Distribution séquentielle maintenue

---

**Statut** : ✅ **Corrigé**  
**Date** : 31 août 2025  
**Impact** : Blackjack automatique + continuité du sabot comme en casino
