# API RESTful monolithique

## Statut

Accepté

## Contexte
Afin d'enregistrer toutes les données du système de réservation de parking, et afin d'appliquer les règles métier, une API est nécessaire.

## Décision

Pour cette API nous avons décidé d'adopter une architecture monolithique plutôt que des microservices après avoir mesuré la petite envergure du système et par souci de simplicité. Les microservices ajouteraient de la complexité inutilement sans apparter de vraie valeur même sur le long terme.

## Conséquences

Un système moins complexe mais un peu plus rigide.
