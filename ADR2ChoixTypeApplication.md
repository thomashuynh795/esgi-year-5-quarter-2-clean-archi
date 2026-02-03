## ADR Choix du type d'application

### Contexte:

Le système doit être accessible à tous les collaborateurs, qu'ils soient au bureau devant leur ordinateur ou dans leur voiture à l'entrée du parking. 
Le public n'est pas nécessairement technophile. Nous devons choisir entre une application native (iOS/Android) ou une application Web.

### Décision:

Nous optons pour une Application Web Responsive (PWA - Progressive Web App).
Ce choix permet d'avoir une URL unique accessible depuis n'importe quel navigateur, tout en offrant une expérience proche du mobile .

### Conséquences:

#### Positives (+) :

Accessibilité maximale : Aucun téléchargement requis, couverture de 100% des appareils (Windows, Mac, iOS, Android).

Déploiement continu : Les corrections de bugs sont visibles immédiatement par tous les utilisateurs dès la mise en ligne.

Coût réduit : Un seul code source à maintenir au lieu de deux (Web + Mobile).

#### Négatives (-) :

Dépendance au réseau : Nécessite une connexion internet (mais c'est aussi le cas pour une application native de parking qui doit interroger l'API).

 