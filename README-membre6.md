# Membre 6 — Social (Likes, Commentaires, Partages, Follow)
**myAppTiktok · feature/social · React Native CLI + Firebase**

---

## Fichiers créés

```
src/
├── services/
│   └── socialService.js                 Toutes les interactions Firestore sociales
└── components/
    └── social/
        ├── LikeButton.jsx               Bouton like animé avec état optimiste
        ├── CommentSheet.jsx             Panneau commentaires (bottom sheet)
        └── ShareButton.jsx             Bouton de partage natif
```

---

## Architecture

Tout passe par `socialService.js`. Les composants ne touchent jamais Firestore directement. Toutes les opérations critiques (like, follow) utilisent des **transactions Firestore** — les compteurs sont donc toujours cohérents même si deux utilisateurs likent en même temps.

### État optimiste

`LikeButton` et `CommentSheet` utilisent l'état optimiste : l'interface se met à jour immédiatement au clic, sans attendre Firestore. Si l'appel échoue, l'état revient en arrière automatiquement. Cela donne une sensation de réactivité instantanée.

---

## Fonctions exportées par `socialService.js`

| Fonction | Rôle |
|----------|------|
| `toggleLike(videoId, userId)` | Like ou unlike — retourne le nouvel état (bool) |
| `isVideoLiked(videoId, userId)` | Vérifie si une vidéo est déjà likée |
| `fetchComments(videoId)` | Charge les 50 derniers commentaires |
| `addComment(videoId, userId, username, avatarUrl, content)` | Ajoute un commentaire |
| `deleteComment(videoId, commentId, userId)` | Supprime (seulement l'auteur) |
| `shareVideo(videoUrl, description)` | Ouvre le menu de partage natif |
| `toggleFollow(currentUserId, targetUserId)` | Suit ou arrête de suivre |
| `isFollowing(currentUserId, targetUserId)` | Vérifie si on suit quelqu'un |

---

## Utilisation des composants

### LikeButton (dans le feed — Membre 3)

```jsx
import LikeButton from '../components/social/LikeButton';

<LikeButton
  videoId={video.id}
  userId={currentUser.uid}
  initialLiked={video.isLiked}
  initialCount={video.likes_count}
/>
```

### CommentSheet (dans le feed — Membre 3)

```jsx
import CommentSheet from '../components/social/CommentSheet';

const [showComments, setShowComments] = useState(false);

<CommentSheet
  visible={showComments}
  onClose={() => setShowComments(false)}
  videoId={video.id}
  currentUser={user}
/>
```

### ShareButton (dans le feed — Membre 3)

```jsx
import ShareButton from '../components/social/ShareButton';

<ShareButton
  videoUrl={video.video_url}
  description={video.description}
/>
```

---

## Intégration avec Membre 8 (Notifications)

Quand un like ou follow est effectué, il faut déclencher une notification. Ajouter cet appel dans `socialService.js` une fois que le Membre 8 a livré son code :

```js
import { createNotification } from './notificationService';

// Dans toggleLike, après le like réussi :
await createNotification(videoOwnerId, userId, 'like', videoId);

// Dans toggleFollow, après le follow réussi :
await createNotification(targetUserId, currentUserId, 'follow');
```

---

## Commandes pour pusher

```bash
git checkout develop && git pull origin develop
git checkout -b feature/social
git add src/components/social/ src/services/socialService.js README-membre6.md
git commit -m "feat: likes, commentaires, partage et follow (Membre 6)"
git push origin feature/social
```

---

*Membre 6 — myAppTiktok | ICT4D | Université de Yaoundé 1*
