## Système de base de données relationel SQL

### Contexte

Pour que l'API puisse persister et lire des données, il faut les sauvegarder dans une base de données.

### Décision

Nous avons choisi un SGBDR SQL (PostgreSQL) parce que c'est structuré, on peut facilement créer des liens entre les tables pour faire de la recherche. Nous avons jugé que nous n'avions pas besoin des fonctionnalités des SQBL NoSQL et avons donc écarté ce choix.

### Conséquences

Bonne sécuritė, plus de structure, facilité pour les développeurs qui sont plus familier avec ce choix et déboggage puis efficace.