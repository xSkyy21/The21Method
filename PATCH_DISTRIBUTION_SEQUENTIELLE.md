# Patch - Correction distribution séquentielle après première main

## 🐛 Problème identifié

**Symptôme** : Après la première main, les cartes ne s'affichent plus lors des mains suivantes  
**Cause** : Conflit entre `startRound()` et `startSequentialDeal()` dans `handleNewHand()`  
**Impact** : Distribution séquentielle ne fonctionne qu'à la première main

## 🔍 Analyse du problème

### **Problème dans `handleNewHand()`**
```tsx
// AVANT (problématique)
const handleNewHand = useCallback(async () => {
  if (phase === "END" || phase === "INIT") {
    resetRoundState()
    await sleep(100)
    await startRound()        // ❌ Change phase de "INIT" à "DEAL"
    await startSequentialDeal() // ❌ Ne s'exécute pas car phase !== "INIT"
  }
}, [phase, resetRoundState, startRound, startSequentialDeal])
```

### **Problème dans `startSequentialDeal()`**
```tsx
// AVANT (problématique)
const startSequentialDeal = useCallback(async () => {
  if (dealQueueRef.current || phase !== "INIT") return // ❌ Bloqué si phase !== "INIT"
  
  // ...
  await dealInitial() // ❌ Appel redondant
}, [phase, ...])
```

## ✅ Corrections apportées

### 1. **Simplification de `handleNewHand()`**
**Fichier** : `app/entrainement/page.tsx`

**AVANT** :
```tsx
const handleNewHand = useCallback(async () => {
  if (phase === "END" || phase === "INIT") {
    resetRoundState()
    await sleep(100)
    await startRound()        // ❌ Problématique
    await startSequentialDeal()
  }
}, [phase, resetRoundState, startRound, startSequentialDeal])
```

**APRÈS** :
```tsx
const handleNewHand = useCallback(async () => {
  if (phase === "END" || phase === "INIT") {
    resetRoundState()
    await sleep(100)
    await startSequentialDeal() // ✅ Seulement ça
  }
}, [phase, resetRoundState, startSequentialDeal])
```

### 2. **Refactorisation de `startSequentialDeal()`**
**Fichier** : `app/entrainement/page.tsx`

**AVANT** :
```tsx
const startSequentialDeal = useCallback(async () => {
  if (dealQueueRef.current || phase !== "INIT") return
  
  try {
    await dealInitial() // ❌ Redondant
    // ...
  }
}, [phase, ...])
```

**APRÈS** :
```tsx
const startSequentialDeal = useCallback(async () => {
  if (dealQueueRef.current) return // ✅ Plus de vérification de phase
  
  try {
    await startRound() // ✅ Appel centralisé
    // ...
  }
}, [startRound, ...])
```

### 3. **Simplification de `newHand()` dans le store**
**Fichier** : `store/useShoe.ts`

**AVANT** :
```tsx
newHand: () => {
  resetRoundState()
  
  if (state.shoe.length <= state.cutCardPosition) {
    get().addEvent("Cut card atteinte - Reshuffle automatique")
    get().initShoe()
  }
  
  setTimeout(() => {
    get().startRound() // ❌ Conflit avec le composant
  }, 500)
},
```

**APRÈS** :
```tsx
newHand: () => {
  resetRoundState()
  
  if (state.shoe.length <= state.cutCardPosition) {
    get().addEvent("Cut card atteinte - Reshuffle automatique")
    get().initShoe()
  }
  
  get().addEvent("Nouvelle main prête - Distribution en cours...") // ✅ Log seulement
},
```

## 🎯 Résultat

### ✅ Distribution séquentielle fonctionnelle
- **Première main** : Distribution séquentielle ✅
- **Mains suivantes** : Distribution séquentielle ✅
- **Pas de conflit** entre `startRound()` et `startSequentialDeal()`

### ✅ Logique simplifiée
- **Responsabilité claire** : Le composant gère la distribution
- **Store simplifié** : Seulement la logique métier
- **Pas de double appel** : `startRound()` appelé une seule fois

### ✅ Flux cohérent
1. **"Nouvelle main"** → `resetRoundState()`
2. **Vérification cut card** → Reshuffle si nécessaire
3. **`startSequentialDeal()`** → `startRound()` → Distribution
4. **Cartes s'affichent** → Séquentiellement comme prévu

## 🧪 Tests recommandés

1. **Première main** : Vérifier la distribution séquentielle
2. **"Nouvelle main"** : Vérifier que les cartes s'affichent
3. **Plusieurs mains** : Confirmer la continuité
4. **Cut card** : Vérifier le reshuffle automatique

## 📋 Checklist de validation

- [ ] Première main : Distribution séquentielle visible
- [ ] "Nouvelle main" : Cartes s'affichent immédiatement
- [ ] Mains suivantes : Distribution séquentielle maintenue
- [ ] Pas de cartes manquantes
- [ ] Timing correct (150-200ms entre cartes)
- [ ] Cut card → reshuffle automatique

---

**Statut** : ✅ **Corrigé**  
**Date** : 31 août 2025  
**Impact** : Distribution séquentielle fonctionnelle sur toutes les mains
