# Backlog — Suno Jam Session

Version initiale : 26 octobre 2026. Source : [analyse critique](ANALYSE.md). Ce fichier est le backlog de référence ; les cartes ne sont pas encore créées en GitHub Issues.

**Statut de toutes les cartes : proposé, non commencé.** La publication des sources, le README, l'audit et ce backlog sont livrés ; les changements fonctionnels restent à réaliser.

P0 = fiabilité avant enrichissement ; P1 = prochain cycle de valeur ; P2 = après premiers retours ; P3 = option à confirmer. Tailles relatives : S = localisé, M = plusieurs composants, L = données et moteur et interface. Ce ne sont pas des estimations calendaires.

## Vue priorisée

| ID | Priorité | Résultat attendu | Taille | Dépendances |
| --- | --- | --- | --- | --- |
| SJS-01 | P0 | « Sans batterie » cohérent dans toutes les sorties | M | — |
| SJS-02 | P0 | Choix utilisateur prioritaires sur les détails du preset | L | — |
| SJS-03 | P0 | Aperçu exact des blocs et différences entre angles | M | — |
| SJS-06 | P0 | Chargement robuste et copie honnête | S | — |
| SJS-04 | P1 | Prompt concis sans minimum artificiel | M | SJS-03 |
| SJS-05 | P1 | Rendu par rubriques et comparaison avec le paragraphe | M | SJS-04 |
| SJS-07 | P1 | Instantanés, A/B et verrous de session | L | SJS-06 |
| SJS-08 | P1 | Journal d'écoute et premier protocole A/B | M | SJS-07 |
| SJS-09 | P1 | Découverte sur plusieurs axes, pas seulement plus sombre | L | SJS-02, SJS-03, SJS-07 |
| SJS-10 | P1 | Greffes écrites comme des relations musicales | L | SJS-02, SJS-09 |
| SJS-11 | P1 | Fiche de passage vers SONORA | M | SJS-05, SJS-07 |
| SJS-12 | P1 | Développement ouvert, structure détaillée facultative | M | SJS-01, SJS-02 |
| SJS-13 | P1 | Exclusions explicables et ajustables | M | SJS-01, SJS-02 |
| SJS-14 | P1 | Tests sémantiques et règles contextuelles | M | À intégrer à SJS-01/02/04/12/13 |
| SJS-18 | P1 | Parcours clavier et mobile confortable | M | SJS-03 |
| SJS-19 | P1 | CI et déploiement Git/Vercel traçables | S | Dépôt publié |
| SJS-15 | P2 | Palette élargie par écoutes, pas par quantité | M | SJS-08, SJS-10 |
| SJS-16 | P3 | Mode chanté distinct, si confirmé | L | SJS-11, SJS-12, SJS-13, décision utilisateur |
| SJS-17 | P3 | Synchronisation multiappareil, si nécessaire | L | SJS-07, SJS-08, décision utilisateur |

## Cartes prêtes à détailler en développement

### SJS-01 — Respecter « Sans batterie » partout

**Besoin :** un choix explicite doit avoir plus de poids qu'une description héritée.

**Acceptation :** pour tous les presets, bases et angles, choisir Sans batterie retire les demandes positives de batterie des détails, greffes, époques, compléments, tags et structure ; les formulations de négation restent possibles. Le cas Rap / Boom bap poussiéreux / seed 1 ne contient plus de caisse claire demandée. Clarifier séparément le sens de « sans kit » et « sans aucune percussion » ; la version choisie est affichée. Le placement devient inactif et les tests couvrent les deux limites du vocabulaire, pas seulement le mot `drums`.

**Preuve actuelle :** `examples.noDrums` dans [les mesures](audit-results.json).

### SJS-02 — Faire respecter les surcharges utilisateur et l'identité du preset

**Besoin :** retirer une guitare ou choisir Trap ne doit pas laisser une autre intention cachée dans le texte.

**Acceptation :** une priorité documentée arbitre utilisateur/preset/territoire ; les phrases déclarent les instruments et intentions dont elles dépendent. Les changements d'instrument mettent à jour les détails concernés ou signalent un conflit explicite. Trap cinématique ne reçoit plus une ouverture boom-bap au hasard, sauf fusion volontaire affichée. Les tags reflètent le preset et l'angle actifs. Les avertissements distinguent une contradiction d'une tension créative assumée.

### SJS-03 — Afficher le texte réellement utilisé

**Besoin :** comprendre l'effet d'un réglage et les différences entre les trois propositions.

**Acceptation :** les aides proviennent des blocs compilés, pas de la première phrase du lexique ; chaque bloc indique conservé/raccourci/retiré/porté par Lyrics. L'angle actif affiche aussi les valeurs dérivées de tension, hypnose et grain. Les paliers sont nommés ; déplacer un slider à l'intérieur du même palier ne promet pas une nuance nouvelle. Une suppression de l'époque est visible près du réglage et de la sortie.

### SJS-04 — Supprimer le remplissage obligatoire

**Besoin :** maximiser la précision musicale par phrase, sans écrire pour remplir une jauge.

**Acceptation :** aucun ajout n'est déclenché uniquement par une longueur inférieure à 900 ; un prompt court n'est pas signalé comme défectueux pour ce seul motif. Plafond interne de 990 conservé initialement. Les blocs importants ont des formes courtes et longues ; les choix verrouillés sont conservés ou un conflit de budget est explicitement signalé. Tests et métriques ne valorisent plus le minimum de caractères. Le format historique reste accessible pendant la comparaison A/B.

### SJS-05 — Ajouter un rendu par rubriques

**Besoin :** retrouver l'écriture structurée appréciée dans l'exploration SONORA.

**Acceptation :** choix Paragraphe / Rubriques à contenu musical équivalent et seed inchangée ; le rendu structuré commence par `Style`, sans nom de preset ni consigne Instrumental dans ce champ. Les rubriques sont sélectionnées pour leur utilité et restent sous le plafond. Le rendu ne force pas une chronologie détaillée. Le défaut final est choisi après comparaison, pas présenté comme acoustiquement supérieur sans écoute.

### SJS-06 — Robustesse de la session et de la copie

**Besoin :** retrouver une application utilisable même après une évolution des données ou un refus de permissions.

**Acceptation :** valider territoire, angle, identifiants, types, valeurs numériques finies et limites au chargement ; versionner le stockage et migrer la clé historique sans perdre les réglages valides. État incomplet/inconnu → repli sûr avec information et réinitialisation accessible. Accès stockage refusé → session en mémoire. « Copié » seulement après écriture réussie ; sinon « Texte sélectionné — copie manuelle » ou erreur claire. Tests avec stockage corrompu et presse-papiers refusé.

### SJS-07 — Garder et comparer une trouvaille

**Besoin :** conserver un groove ou une greffe pendant qu'on explore autre chose.

**Acceptation :** deux instantanés A/B contenant les quatre textes exacts, réglages résolus, angle, seed et versions moteur/catalogue ; export/import JSON validé ; retour à un instantané sans recalcul destructif. Verrous d'identité, greffe et groove respectés lors d'un tirage. Comparaison séparant changements de formulation et changements musicaux. Sauvegarde locale d'abord, sans compte obligatoire.

### SJS-08 — Journal d'écoute minimal et expérimentation

**Besoin :** décider sur ce qui s'entend, sans multiplier les crédits dépensés au hasard.

**Acceptation :** rattacher chaque essai à un instantané, un modèle Suno, ses paramètres saisis, un lien audio et des notes. Évaluer séparément fidélité au brief, signature, greffe, voix parasite, dérive et envie de réécoute ; autoriser « non évalué ». Export portable. Préparer 6 paires A/B sur 3 terrains contrastés avec une seule hypothèse variable par paire ; budget et lancement des générations décidés par l'utilisateur. Aucun score automatique d'audio non écouté.

### SJS-09 — Diversifier les directions de découverte

**Besoin :** quitter une habitude sans perdre tout ancrage personnel.

**Acceptation :** au moins quatre axes indépendants (rythme, harmonie, instrumentation/geste, espace/forme) ; aucune hausse de tension/grain imposée à toutes les découvertes. Chaque variante expose ce qui reste et ce qui change. Les verrous sont respectés. Inclure des exemples éloignés plus lumineux, plus dépouillés et plus acoustiques. Distance éditoriale expliquée ; efficacité musicale évaluée via SJS-08.

### SJS-10 — Transformer les greffes en interactions

**Besoin :** entendre une fusion structurante, au-delà d'un instrument ajouté.

**Acceptation :** une greffe déclare un rôle, un registre, une relation au groove/motif et ses compatibilités. Produire d'abord 6 exemples sur 3 territoires, avec versions discrète/structurante. Le Style décrit le dialogue ou le remplacement musical ; Structure et Tags restent cohérents. Ne généraliser au catalogue qu'après examen des essais.

### SJS-11 — Exporter une fiche SONORA

**Besoin :** transférer une identité testée sans refaire le cadrage.

**Acceptation :** copie Markdown et export avec identité, rôles instrumentaux, groove, signature, greffe, place voix, contraintes et versions testées. Le Style prêt à coller est distinct des métadonnées et du nom de preset. Aucune prétention d'intégration API SONORA. L'outil n'écrit ni ne réécrit des paroles à l'occasion de l'export.

### SJS-12 — Rendre la structure optionnelle et ouverte

**Besoin :** guider un développement sans figer tous les retours et les solos.

**Acceptation :** modes Développement ouvert / Structure détaillée ; structure désactivable. Solo explicite et facultatif. Aucun instrument non choisi n'est introduit par défaut dans les balises. Absence de batterie respectée. Distinguer intention musicale et comportement vérifié à l'écoute ; les balises ne sont pas présentées comme des commandes garanties.

### SJS-13 — Exclusions motivées par la session

**Besoin :** éviter une dérive sans éliminer une découverte désirée.

**Acceptation :** montrer la raison de chaque suggestion, permettre activation/désactivation et liste vide. Priorité aux interdictions utilisateur ; détecter les conflits avec une greffe voulue. Conserver initialement trois suggestions maximum comme choix d'interface, sans en faire une règle Suno. Adaptation des exclusions vocales au futur mode chanté. Test des interactions voix/batterie/greffe.

### SJS-14 — Tester les intentions et contextualiser le lint

**Besoin :** ne pas confondre 76 tests verts avec une cohérence musicale complète.

**Acceptation :** tests couvrant tous les paliers, sliders extrêmes, aucun/quatre instruments, absence de batterie, presets surchargés, conflits de greffes, état importé et limites de longueur. Contrôles de cohérence entre les quatre sorties. Reconnaissance d'artistes insensible à la casse et message prudent ; règles lexicales contextualisées au mode et à la phrase. Tests audio séparés des tests texte. Ajouter les régressions avec chaque correction, sans attendre une refonte globale du lint.

### SJS-15 — Élargir le catalogue à partir des écoutes

**Besoin :** dépasser les terrains sombres et rock sans devenir un catalogue générique.

**Acceptation :** sélectionner 3 nouvelles pistes avec l'utilisateur et leur contraste recherché (par exemple groove clair, acoustique rythmique, électronique dépouillée). Chaque piste possède une identité et une interaction musicale décrites, pas un simple nom de genre. Statut éditorial / testé à l'écoute / retenu visible. Conserver ou retirer les pistes selon les essais ; ne pas viser un nombre arbitraire de presets.

### SJS-16 — Mode chanté distinct (à confirmer)

**Besoin historique :** explorer aussi des chansons tout en conservant un parcours instrumental clair.

**Décision préalable :** ce besoin est-il porté par Suno Jam Session ou laissé à SONORA ?

**Acceptation si retenu :** mode explicite, caractère vocal et rôle de la voix ; aucun `[Instrumental]` ni exclusion vocale incompatible ; contenu Lyrics fourni préservé verbatim. Migration conservant le mode instrumental existant. Cette carte n'autorise pas l'ajout immédiat d'un éditeur de paroles.

### SJS-17 — Synchronisation facultative (à confirmer)

**Besoin possible :** retrouver sessions et journal sur plusieurs appareils.

**Décision préalable :** confirmer un besoin réel après l'export/import local.

**Acceptation si retenu :** synchronisation opt-in, conflits gérés, export et suppression accessibles, usage local préservé ; choisir stockage/authentification seulement après cadrage. Pas d'envoi automatique d'audios ou de paroles.

### SJS-18 — Clavier, focus et accès mobile au résultat

**Besoin :** comparer et copier sans parcourir constamment toute la page.

**Acceptation :** onglets navigables au clavier avec focus conservé après rendu ; annonces accessibles courtes ; boutons Copier identifiables par sortie. À 360, 768 et 1280 px : pas de débordement horizontal, champs utilisables et accès rapide au résultat. Essai de bout en bout territoire → preset → réglage → angle → copie. Ne pas réduire arbitrairement la taille du texte pour gagner de la place.

### SJS-19 — Versionner, tester et déployer automatiquement

**Besoin :** savoir quelle version tourne en ligne et éviter une régression à la publication.

**Acceptation :** CI sur PR et main exécutant installation reproductible, tests et build ; permissions minimales et aucun secret embarqué. Connecter le dépôt au projet Vercel existant, vérifier branche de production et aperçu. Afficher ou documenter la révision déployée. Protocole de retour à la version précédente. Le passage du contrôle CI avant production doit être vérifié, pas supposé parce que deux automatisations existent.

## Lots suggérés

1. **Confiance dans les réglages :** SJS-01, SJS-02, SJS-03, SJS-06, avec régressions SJS-14. Sortie : les choix visibles correspondent aux textes copiés.
2. **Prompts comparables :** SJS-04, SJS-05, SJS-07, SJS-08 ; SJS-19 en parallèle dans le planning. Sortie : quelques comparaisons d'écoute traçables, sans remplissage obligatoire.
3. **Découverte musicale :** SJS-09, SJS-10, SJS-11, SJS-12, SJS-13, SJS-18. Sortie : directions distinctes, transférables à SONORA et agréables à utiliser.
4. **Extension guidée par l'usage :** SJS-15, puis décisions SJS-16/17.

Commencer concrètement par SJS-01 et SJS-06, puis la représentation des blocs de SJS-03 : ces changements ont des critères observables sans consommer de génération Suno. Reporter la refonte visuelle, les comptes et le catalogue massif.

## Suivi

À chaque carte commencée : ajouter responsable, statut, lien de PR et preuves d'acceptation. À chaque carte terminée : noter la révision livrée et les limites restantes. Les tailles et priorités sont à réévaluer après le premier lot d'écoute. Aucun engagement de date n'est posé.
