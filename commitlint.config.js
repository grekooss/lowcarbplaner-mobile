module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nowa funkcjonalność
        'fix', // Naprawa błędu
        'docs', // Dokumentacja
        'style', // Formatowanie, brak zmian w kodzie
        'refactor', // Refaktoryzacja kodu
        'test', // Dodanie/aktualizacja testów
        'chore', // Zadania serwisowe (aktualizacja zależności, konfiguracji)
        'perf', // Poprawa wydajności
        'ci', // Zmiany w CI/CD
        'build', // Zmiany w build systemie
        'revert', // Cofnięcie poprzedniego commita
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
}
