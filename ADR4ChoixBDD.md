## Système de base de données relationel SQL

### Contexte

L'application nécessite un stockage persistant pour les utilisateurs, les places de parking et les réservations.
Nous devons garantir qu'une place ne peut pas être réservée deux fois pour le même créneau horaire.
Deux options ont été étudiées : un stockage simple via un fichier JSON (plus léger) ou une base de données SQL (PostgreSQL).

### Décision

Nous avons choisi un SGBDR SQL (PostgreSQL) parce que c'est structuré, on peut facilement créer des liens entre les tables pour faire de la recherche.
Nous avons jugé que nous n'avions pas besoin des fonctionnalités des SQBL NoSQL et avons donc écarté ce choix.
Bien qu'un fichier JSON soit plus simple à mettre en place au début, il ne répond pas aux exigences de sécurité et de fiabilité d'un système de réservation.

 

 
### Conséquences

#### Positives (+) :

Gestion de la concurrence : Contrairement à un fichier JSON qu'on ne peut pas modifier à plusieurs en même temps sans risque de corrompre le fichier, PostgreSQL gère les accès simultanés (si 10 personnes réservent à la même seconde).

Performance : Si on a 10 000 réservations dans l'historique, PostgreSQL les parcourt en millisecondes. Lire un fichier JSON géant ralentirait l'application.

Relations : On peut facilement lier un utilisateur à son historique sans dupliquer les données.

#### Négatives (-) :

Infrastructure : Nécessite d'installer et de maintenir un serveur de base de données (alors qu'un JSON est juste un fichier sur le disque).