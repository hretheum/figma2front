# Użycie design tokens (@hretheum/tokenz)

Źródło prawdy: repo `hretheum/tokenz` (branch `main`).

## Instalacja

- Docelowo z npm (po publikacji):

```sh
npm i @hretheum/tokenz
```

- Tymczasowo z GitHub (do czasu publikacji na npm):

```sh
npm i github:hretheum/tokenz#main
```

## Import i użycie (Vite/TS)

W `tsconfig.json` jest już włączone `resolveJsonModule: true`, więc możesz importować JSON bez dodatkowej konfiguracji.

```ts
import tokens from '@hretheum/tokenz/tokens.json';

// przykład: dostęp do koloru brand
const brand = tokens.values.color.brand.value; // np. "#1D4ED8"
```

## Storybook – przykład

Dodaliśmy story `Tokens.stories.tsx`, które pokazuje podgląd koloru "brand".
Uruchom Storybook:

```sh
npm run storybook
```

## Publikacja paczki (w repo tokenz)

- Ustaw sekret `NPM_TOKEN` w `hretheum/tokenz` (Settings → Secrets and variables → Actions).
- Utwórz Release `v0.0.1` lub uruchom workflow `Publish to npm` ręcznie.
- Po publikacji zaktualizuj zależność w tym repo, zamieniając wpis GitHub na wersję z npm, np. `^0.0.1`.

