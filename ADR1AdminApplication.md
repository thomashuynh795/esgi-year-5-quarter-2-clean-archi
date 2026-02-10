## ADR Choix d'une application admin

### Contexte:
L'équipe métier a exprimé le besoin de pouvoir modifier certains paramètres critiques du système, notamment le nombre de places réservées aux gérants. 
Cependant, les spécifications indiquent que la structure physique du parking est fixe et que ces valeurs ne changeront que de manière exceptionnelle (potentiellement une fois tous les deux ou trois ans).

### Décision:
Nous décidons de ne pas développer d'interface d'administration (Back-office) dédiée à ces modifications.

À la place, nous utiliserons un fichier de configuration externalisé (ex: config.yaml ou settings.json) :

Les paramètres de capacité et de quotas seront stockés dans ce fichier.

Le fichier sera accessible et modifiable directement par les administrateurs métier (via un accès sécurisé au serveur ou un dépôt de configuration).

Le système chargera ces valeurs au démarrage (ou via un rafraîchissement à chaud).

### Conséquences:

#### Positives (+) :

Réduction drastique des coûts de développement et de maintenance (pas d'UI, pas d'API d'admin, pas de gestion de droits complexes).

Simplicité du code : Moins de composants dans notre diagramme de conteneurs C4.

Rapidité de mise en œuvre : Le système est prêt immédiatement.

#### Négatives (-) :

Expérience utilisateur brute : La modification nécessite d'éditer un fichier texte (risque d'erreur de syntaxe).

Processus manuel : Nécessite une procédure (même simple) pour accéder au fichier et le modifier.