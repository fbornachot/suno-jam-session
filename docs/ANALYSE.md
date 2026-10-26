# Analyse critique — Suno Jam Session

Date : 26 octobre 2026. Périmètre : code importé de Session Rack v2, renommage et configuration Vercel. Cette analyse n'implémente pas les évolutions proposées.

## Avis d'ensemble

La base est utile : un catalogue éditorial lisible, des réglages musicaux concrets et une génération immédiate sans coût d'API. Son prochain progrès doit être de **mieux respecter l'intention choisie et rendre les différences compréhensibles**, avant de multiplier les presets.

Aujourd'hui, le moteur garantit surtout une forme textuelle. Il n'assure pas encore que toutes les phrases décrivent le même morceau. Une variation de mots ne constitue pas non plus une découverte musicale.

## Besoins qui orientent les propositions

Les échanges antérieurs sur l'exploration en amont de SONORA indiquent : nourrir SONORA avec des identités nouvelles ; mêler familiarité et découvertes éloignées ; privilégier une écriture musicale concrète, des prompts par rubriques et un arrangement ouvert, sans remplissage. L'intérêt pour le grain, le groove, les instruments et les dynamiques ressort aussi de cette version.

Ces préférences historiques sont un **cadre de proposition**, pas une nouvelle spécification imposée à Session Rack. Deux points restent à arbitrer : conserver la présentation en paragraphe ou revenir aux rubriques ; rester centré sur les instrumentaux ou ouvrir un usage chanté à terme. La version rapatriée reste instrumentale. Les futurs traitements de paroles devront préserver le texte fourni sans modification implicite.

## Ce qu'il faut conserver

- Séparation du catalogue, du moteur et de l'interface : les évolutions éditoriales peuvent être ciblées.
- Trois angles immédiatement comparables et greffes propres aux territoires.
- Un preset « Création » par territoire, qui ouvre déjà la palette au-delà des références.
- Batterie, placement, grain, signature et espace : des entrées pertinentes pour décrire une identité audible.
- Déterminisme du moteur, copie séparée des champs, faible coût d'hébergement et absence de backend obligatoire.
- Les 76 tests existants couvrent 4 500 sorties de presets et bases. Ils constituent une bonne protection contre les régressions de format.

## Mesures reproductibles

Commande : `npm run audit`. Source : [scripts/audit.test.ts](../scripts/audit.test.ts). Données : [audit-results.json](audit-results.json).

Échantillon : 12 territoires × 5 configurations (4 presets + base) × 25 seeds × 3 angles. Les proportions portent sur cet échantillon déterministe, pas sur les usages réels. Les sliders personnalisés, retraits d'instruments et autres combinaisons ne sont pas exhaustivement couverts.

| Observation | Mesure | Interprétation |
| --- | ---: | --- |
| Longueur du prompt | 900–990 caractères sur 4 500 sorties | La cible interne est respectée |
| Sorties recevant du remplissage | 308 / 4 500, soit 6,8 % | Ajouts motivés par la longueur minimale |
| Arc retiré du Style | 1 533 / 4 500, soit 34,1 % | La structure Lyrics subsiste ; ce retrait n'est pas signalé |
| Époque retirée du Style | 298 / 4 500, soit 6,6 % | Le choix reste visible dans les réglages |
| Aperçu d'époque différent du texte conservé | 1 864 / 4 202, soit 44,4 % | La promesse de « phrase exacte » n'est pas tenue |
| Greffe ou détail de preset retiré | 0 sur cet échantillon | Ne pas présenter leur disparition comme un défaut mesuré |
| Place pour la voix perdue | 0 / 4 500 variantes supplémentaires | L'option est préservée dans ce protocole |

13 317 caractères de phrases de remplissage ont été ajoutés au total, hors espaces de jonction. Leur présence n'implique pas automatiquement un mauvais résultat sonore ; elle indique une priorité éditoriale discutable.

## 1. Fiabilité sémantique : priorité immédiate

**Constat reproduit.** Rap / beat → Boom bap poussiéreux → Sans batterie → Accessible → seed 1 donne simultanément une description de caisse claire et une consigne sans percussion. Exclude contient bien `drums`, mais le Style continue à demander une caisse claire. Le lint ne signale rien. Voir `examples.noDrums` dans les résultats.

**Cause.** Le détail du preset, l'époque, les phrases supplémentaires et certaines greffes sont injectés indépendamment du choix de batterie. Choisir un autre instrument ne réécrit pas non plus les détails du preset qui le citent.

**Autre cas.** Trap cinématique, seed 1, commence par une identité boom-bap et conserve `boom bap` dans les tags. Cela peut être un mélange voulu, mais l'interface ne l'annonce pas comme tel : le tronc du territoire écrase en partie l'identité du preset.

**Proposition.** Définir les priorités : interdictions explicites → choix utilisateur → identité du preset → défauts du territoire → enrichissements facultatifs. Modéliser les dépendances des phrases, puis supprimer, adapter ou signaler les incompatibilités. Ne pas remplacer cela par une interdiction globale de quelques mots.

Backlog : SJS-01, SJS-02, SJS-14.

## 2. Donner une représentation fidèle de ce qui part dans Suno

**Constat vérifié.** `first()` dans l'interface montre la première formulation de l'époque ou de la batterie ; le moteur en tire une autre avec la seed. Les aides ne savent pas non plus si le bloc a été retiré par `fit()`.

Les réglages visibles restent ceux de la base quand un angle dérivé augmente tension, hypnose ou grain. Le résumé des différences montre greffe, arc et signature, mais pas ces augmentations.

**Proposition.** Chaque bloc de sortie devrait connaître son origine, sa formulation exacte et son état : conservé, raccourci, retiré, transféré à Lyrics. L'utilisateur doit voir les valeurs réellement utilisées par l'angle actif. Afficher les paliers des sliders et désactiver le placement quand il n'y a pas de batterie.

Backlog : SJS-03.

## 3. Écrire un meilleur prompt avant d'écrire un prompt plus long

**Constat vérifié.** `fit.ts` impose un plancher de 900 caractères et ajoute des phrases générales. `assemble.ts` écrit un paragraphe, pas le format par rubriques apprécié lors des essais SONORA. Certains blocs sont supprimés entièrement alors qu'une formulation plus courte conserverait leur sens.

**Proposition.** Conserver un plafond de travail inférieur à 1 000 caractères, supprimer le plancher comme obligation, puis offrir des blocs à formulation courte/longue. Les éléments verrouillés par l'utilisateur passent avant les enrichissements. Tester deux rendus d'une même représentation : paragraphe actuel et rubriques commençant par `Style`. Ne pas recopier systématiquement toutes les rubriques si elles n'apportent rien.

**Hypothèse à écouter.** Une formulation plus courte, structurée et moins contradictoire pourrait mieux porter l'intention. Le nombre de caractères seul ne permet pas de le conclure.

Backlog : SJS-04, SJS-05, SJS-08.

## 4. « Hors zone » doit devenir une vraie distance créative

**Constat vérifié.** L'angle Hybride ajoute 10 de tension. Hors zone ajoute 15 de tension, 15 d'hypnose et 10 de grain, avec plafonnement à 100. Il change aussi l'arc, la greffe et parfois la signature. La greffe est généralement ajoutée avec une formule « Plus… ».

**Conséquence probable.** Le moteur associe la découverte à davantage de noirceur ou de rugosité. Une autre couleur instrumentale peut rester un ajout superficiel au même langage rythmique. Inversement, certaines greffes pourront très bien fonctionner : aucune écoute comparative n'a encore été menée ici.

**Proposition.** Explorer des axes indépendants : source rythmique, langage harmonique, rôle instrumental, espace, geste et forme. Garder un ancrage familier et choisir une rupture explicite. Écrire la relation entre les éléments : qui porte le motif, qui répond, qui remplace le backbeat, quel registre reste libre. Introduire aussi des découvertes plus claires, plus sèches, plus aérées ou acoustiques.

Backlog : SJS-09, SJS-10, SJS-15.

## 5. Préserver une trouvaille et comparer sans la perdre

**Constat vérifié.** Une seule session est enregistrée dans localStorage. Changer de territoire ou de preset remplace les réglages. Nouveau tirage modifie plusieurs formulations et les angles ; aucun verrou ne permet de garder la greffe trouvée. La seed est affichée, mais ne peut pas être saisie ou exportée depuis l'interface.

**Proposition.** Ajouter d'abord un instantané portable et deux emplacements A/B, avec verrouillage de l'identité, de la greffe et du groove. Exporter les textes exacts ainsi que réglages, seed et version du moteur. Un export de la seule seed ne suffit pas à reproduire une ancienne version du catalogue.

La demande historique de simplicité plaidait pour une V1 sans sauvegarde. La bibliothèque proposée ici reste donc légère ; la synchronisation distante vient seulement si le besoin multiappareil est confirmé.

Backlog : SJS-06, SJS-07, SJS-17.

## 6. Organiser la preuve musicale

Les tests passent, mais ils ne vérifient ni la cohérence globale de tous les réglages, ni l'interprétation Suno des balises, ni la présence effective de la greffe. Le test « trois angles différents » compare du texte sur une seule base ; il ne mesure pas une distance musicale.

**Proposition.** Un journal d'écoute minimal : instantané du prompt, modèle Suno, paramètres de génération saisis par l'utilisateur, liens audio, signature reconnaissable, greffe audible, dérive indésirable, voix parasite et envie de réécoute. Séparer « fidèle au brief » de « morceau que j'aime ».

Commencer par 6 comparaisons A/B sur 3 terrains contrastés : un terrain familier, une greffe proche et une découverte. Faire varier une seule hypothèse par paire, conserver les autres paramètres et noter tous les résultats. Un second passage sur les cas ambigus aide à distinguer un effet répété du hasard. Ce petit lot est exploratoire, pas une démonstration statistique. Ne pas lancer 48 presets d'un coup ; le budget de générations reste une décision utilisateur.

Backlog : SJS-08, SJS-14.

## 7. Clarifier la passerelle SONORA et la place de la voix

La case voix laisse un espace de médiums, mais la structure commence toujours par `[Instrumental]` et le lint bannit le vocabulaire vocal. Ce comportement correspond bien à une base destinée à recevoir une topline plus tard ; ce n'est pas un mode chanson.

**Proposition.** Exporter une fiche SONORA : identité, agents musicaux, groove, greffe, rôle du lead, espace voix, contraintes et alternatives testées. Les métadonnées de preset restent hors du Style. Une fonction chantée distincte reste une option ultérieure, à arbitrer ; ne pas mélanger automatiquement des paroles à la structure instrumentale.

Backlog : SJS-11, SJS-16.

## 8. Structure, exclusions et garde-fous

Les structures imposent une succession de sections et peuvent ajouter un solo automatiquement. Sans instrument sélectionné, le repli peut encore introduire une basse (`examples.noInstruments`). Un mode de développement ouvert et une structure détaillée optionnelle conviendraient mieux à l'exploration.

Les exclusions sont fixes par territoire, limitées à trois, et non ajustables. Une exclusion peut bloquer une greffe recherchée. La documentation officielle Suno décrit Exclude comme un moyen d'écarter des éléments ; elle n'établit pas un optimum de trois ni une garantie de suppression. [Source Suno](https://help.suno.com/en/articles/3161921).

Le lint contient des interdictions globales adaptées à cette version instrumentale, mais parfois trop générales pour un futur catalogue. Le contrôle d'artistes est sensible à la casse et sa liste est partielle ; le message « Suno le rejettera » est plus catégorique que ce contrôle ne permet de l'affirmer.

Backlog : SJS-12, SJS-13, SJS-14.

## 9. Robustesse et confort

- `load()` vérifie seulement que le territoire existe. Un stockage JSON valide mais incomplet peut casser le rendu ; un ancien angle inconnu peut laisser la sortie introuvable.
- Le repli de copie sélectionne le texte et annonce quand même « Copié » : il faut distinguer sélection et écriture effective dans le presse-papiers.
- Le rendu complet de la sortie remplace les onglets après chaque clic : préserver le focus et proposer une navigation clavier des onglets. Le grand `aria-live` peut également rendre les mises à jour trop bavardes.
- La sortie suit tous les contrôles sur petit écran : un accès rapide à « Voir / copier le résultat » mérite un essai mobile. Ceci est une hypothèse ergonomique issue du code, pas un audit mobile complet.
- L'hébergement fonctionne ; la CI et la connexion Git/Vercel restent à mettre en place. Aucun besoin immédiat de réécriture React, de backend ou de génération par LLM n'est démontré.

Backlog : SJS-06, SJS-18, SJS-19.

## Ordre recommandé

1. Fiabiliser « Sans batterie », les surcharges de preset, les aperçus et le stockage.
2. Enlever le remplissage obligatoire, introduire les rubriques et des instantanés A/B.
3. Tester sur quelques générations et consigner l'écoute.
4. Enrichir les relations musicales et les directions de découverte à partir de ces résultats.
5. Étudier le chant et la synchronisation uniquement si l'usage les justifie.

## Sources et limites

- Preuves de fonctionnement : fichiers du dépôt et mesures régénérables liées plus haut.
- Contexte de conception : préférences exprimées dans les échanges antérieurs, à reconfirmer pour les arbitrages signalés.
- [Crate Machine](https://normaprods.com/fr/pages/crate-machine), consulté le 26 octobre 2026 : son objectif affiché reste la matière à sampler ; Suno Jam Session poursuit une exploration d'identités et de développements plus large.
- [Aide officielle Suno — Exclude](https://help.suno.com/en/articles/3161921), consultée le 26 octobre 2026.
- Aucun audio n'a été généré ou évalué dans cet audit. Les balises de structure sont des indications à tester, pas un contrat d'exécution établi par cette analyse.
