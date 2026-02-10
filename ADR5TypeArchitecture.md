## API RESTful monolithique

### Contexte

L'application doit gérer des fonctionnalités cohérentes et interdépendantes (utilisateurs, places, réservations).
Nous devons choisir entre un monolithe (un seul bloc de code) et des microservices (plusieurs services indépendants).

### Décision

Nous choisissons une Architecture Monolithique.
Compte tenu de la taille de l'équipe et de la portée du projet (parking d'entreprise), la complexité opérationnelle des microservices (gestion du réseau, déploiements multiples, latence) n'est pas justifiée.

### Conséquences

 
#### Positives (+) :

Simplicité de développement : Tout le code est au même endroit, ce qui facilite le débogage et les tests de bout en bout  .

Déploiement facilité : Un seul artefact à déployer sur le serveur.

Performance : Les appels entre les différentes parties du système se font en mémoire, sans passer par le réseau (pas de latence).

Coût d'infrastructure : Moins de serveurs et de ressources nécessaires pour faire tourner l'application.

#### Négatives (-) :

Scalabilité globale : On ne peut pas scaler uniquement la partie "Réservation" sans scaler toute l'application (mais pour un parking, le trafic restera maîtrisé).