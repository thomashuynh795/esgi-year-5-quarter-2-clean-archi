## ADR Admin Application

### Titre:
Choix d'une application admin

### Contexte:
Face à la demande métier, nous devons faire un choix sur la création d'une application admin afin de modifier des valeurs tels que le nombre de places réservées aux gérants.

### Décision:
La création d'une application admin pour notre contexte va juste ajouter de la complexité. Le métier affirme que très peu voir, aucun changement sera fais au cours des futurs années du fait que le parking ne va pas changer. 

Pour les rares changements qui peuvent être fais, on peut mettre les valeurs à modifier dans un fichier configuration au quelle le métier aura la main dessus.

### Conséquences:

Un système plus simple et moins complexe.