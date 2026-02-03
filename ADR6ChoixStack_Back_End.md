## ADR Choix d'une application admin

### Contexte
Pour notre API monolithique, nous devons choisir un langage et un outil pour communiquer avec la base de données PostgreSQL.
Nous avons hésité entre Java (Spring Boot) et Node.js (TypeScript), ainsi qu'entre plusieurs ORM (TypeORM, Sequelize, Prisma).

### Décision

Nous choisissons Node.js avec TypeScript et l'ORM Prisma. L'équipe maîtrise mieux l'écosystème TypeScript. 
Prisma est choisi pour sa capacité à générer un client de base de données fortement typé automatiquement.


### Conséquences
#### Positives (+) :

Fullstack de bout en bout : En utilisant TypeScript partout, on réduit la charge mentale des développeurs.

Productivité (Prisma) : Prisma permet de faire des migrations de base de données très simples et offre une autocomplétion parfaite. On évite les erreurs de requêtes SQL mal écrites.

Sécurité du typage : Si on change une colonne dans PostgreSQL, Prisma nous prévient immédiatement partout où cette donnée est utilisée dans l'API.

#### Négatives (-) :

Performance : Sur des calculs mathématiques très lourds, Node.js pourrait être moins performant que Spring (Java), mais pour un système de réservation, la différence est invisible.



 