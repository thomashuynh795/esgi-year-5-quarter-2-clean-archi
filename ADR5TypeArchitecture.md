# API RESTful monolithique

## Contexte

Afin d'enregistrer et de fournir toutes les données du système de réservation de parking, et afin d'appliquer les règles métier, une API est nécessaire.

## Décision

Pour cette API nous avons décidé d'adopter une architecture monolithique plutôt que des microservices après avoir mesuré la petite envergure du système et par souci de simplicité. Les microservices ajouteraient de la complexité inutilement sans apporter de vraie valeur même sur le long terme.

## Conséquences

Un système plus simple mais qui peut être plus rigide si on ajoute énormément de fonctionnalités.
