# Lot cohérence et découverte — 27 octobre 2026

Périmètre : propositions utilisateur 1, 2 et 5. Aucun compte, journal, sauvegarde de favoris ou mode chanté ajouté. L'algorithme de remplissage 900–990 et les balises détaillées restent en place ; la proposition 3 attend une comparaison et une validation distinctes.

## Choix prioritaires

- Les réglages résolus de l'utilisateur priment sur les phrases héritées du preset et du territoire. Les angles peuvent modifier les paramètres annoncés, mais conservent territoire, tempo, tonalité, batterie et sélection instrumentale (hors résolution du conflit avec Percussions).
- « Sans batterie ni percussions rythmiques » interdit kits, claps, toms, congas, etc. Les instruments à hauteur déterminée, dont vibraphone et glockenspiel, restent possibles. Les percussions rythmiques sélectionnées sont écartées, avec une explication ; leur sélection de départ n'est pas détruite.
- Une signature qui exige une source absente (batterie, basse, guitare) devient une boucle avec avertissement. La structure n'invente plus une basse de secours.
- Chaque phrase héritée est vérifiée contre un vocabulaire de dépendances sonores. La phrase entière est écartée lorsqu'elle impose un instrument absent. Pour les détails de preset non structurés, une surcharge de forme, de son, de batterie ou d'instruments les désactive prudemment. C'est volontairement conservateur : une description peut être perdue même si une partie restait pertinente.
- Une greffe est une addition explicite à la sélection, annoncée dans la sortie. Elle peut donc introduire un nouvel instrument, mais jamais contourner l'absence de batterie. Les six interactions pilotes définissent rôle, registre et relation au motif ; leur contrat permet aussi des prérequis instrumentaux.
- Trap cinématique a son identité propre ; les tags sont construits depuis les réglages et les blocs retenus, au lieu de reprendre systématiquement ceux du territoire.

## Aperçus

Le moteur retourne les blocs et leur statut. Les aperçus sont issus de cette trace, jamais de la première variante du lexique. La concaténation ordonnée des blocs conservés reproduit exactement le Style copié, y compris les compléments historiques.

Les statuts distinguent conservé, retiré pour la longueur, écarté pour cohérence et porté par Structure. Les blocs ne sont pas raccourcis dans cette version : aucun faux statut de raccourcissement n'est affiché. Les paliers et valeurs de l'angle actif sont visibles. Les valeurs de départ restent modifiables sans être remplacées par celles de la variante.

## Découvertes

La seed choisit une des quatre directions « Hors zone ». Les instruments de départ restent présents ; le geste acoustique concerne la greffe et l'articulation, pas la conversion de tout le morceau en acoustique.

| Direction | Changements annoncés |
| --- | --- |
| Rythme | Placement alterné et degré de répétition ; aucun placement ajouté sans batterie |
| Harmonie lumineuse | Tension réduite, euphorie retenue et chaleur ; tonalité de départ conservée |
| Geste acoustique | Greffe acoustique si disponible, saturation et racines réduites, autre signature compatible |
| Espace dépouillé | Espace proche, grain réduit, autre arc |

Les six interactions pilotes : cuivres samplés et flûte sur Rap / beat ; orgue et cuivres graves sur Indie rock ; piano préparé et cor sur Néo-classique. Les angles Accessible/Hybride utilisent la relation discrète ; Hors zone utilise la relation structurante lorsqu'il sélectionne l'une de ces greffes. Les autres greffes gardent leur rédaction historique en attendant l'examen des pilotes.

## Vérification et limites

- `npm test` : 95 tests, dont 4 500 sorties historiques et 2 160 configurations sans batterie avec percussion sélectionnée et signature batterie, tous angles compris.
- Contrôles supplémentaires : retrait des guitares, absence de basse implicite, identité Trap, quatre directions, déterminisme et trace exacte du texte copié.
- `npm run build` : vérification TypeScript et bundle Vite.
- `npm run audit` : mesures de la version courante dans `audit-results-current.json`. Le fichier `audit-results.json` reste la preuve historique de l'analyse initiale. La différence avec la première variante du lexique est désormais une observation, pas une erreur d'aperçu.
- Vérification navigateur : absence de batterie et placement inactif, bascule d'angle, aperçus et détail des blocs.

Ces contrôles portent sur le texte et l'interface. Ils ne démontrent pas que Suno respecte les consignes ni que les nouvelles greffes donnent de meilleurs morceaux. Le vocabulaire de compatibilité est propre au catalogue actuel : une nouvelle description doit être revue et accompagnée d'un test si elle introduit un instrument ou une contrainte nouvelle.
