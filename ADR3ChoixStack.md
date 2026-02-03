## ADR Choix de la stack a utiliser pour l'appliction mobile et web 


### Contexte:
Nous avons décidé de construire une application Web Responsive.
Nous devons choisir une bibliothèque ou un framework JavaScript pour le front-end.
Les options principales étaient React, Angular et Vue.js.

### Décision:
 
Nous choisissons React pour le développement de l'interface utilisateur.

### Conséquences:

#### Positives (+) :

Vitesse de livraison (Time-to-market) : L'équipe ayant déjà une expertise forte sur React, nous évitons une phase d'apprentissage (courbe d'apprentissage nulle).

Écosystème riche : Large disponibilité de bibliothèques de composants (ex: MUI, Tailwind UI) pour créer l'interface du parking rapidement.

Recrutement : React est la technologie la plus populaire sur le marché, ce qui facilite l'ajout de nouveaux développeurs sur le projet si besoin.

#### Négatives (-) :

Liberté de choix : Contrairement à Angular qui est "tout-en-un", React nécessite de choisir nous-mêmes d'autres bibliothèques (pour le routage, la gestion d'état, etc.), ce qui demande une certaine rigueur pour garder le code propre.


 