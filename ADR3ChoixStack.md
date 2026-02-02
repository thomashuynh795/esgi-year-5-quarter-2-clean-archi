## ADR Choix de la stack a utiliser pour l'appliction mobile et web 


### Contexte:
Pour développer une application mobile et web disponible sur iOS et Android, les contraintes principales sont le délai de mise en prod et la coherence entre les deux systemes.
On a donc le choix entre : développement en  Swift (iOS) et Kotlin (Android) ou de developper une fois en  Flutter.


### Décision:
Développement Flutter : Base de code unique nous écrivons le code une seule fois pour les trois plateformes avec des différences minime.


### Conséquences:
Réduction des coûts et des délais et une maintenance simplifier.