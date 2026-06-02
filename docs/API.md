# Documentation API

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.validateur.com/api
```

## Authentification

Toutes les routes protégées nécessitent un header:
```
Authorization: Bearer <token_jwt>
```

Le token est reçu lors de la connexion ou l'enregistrement.

## Formats de Réponse

### Succès
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Erreur
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## 🔐 Authentification

### POST /auth/signup
Créer un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse:** `201 Created`
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER"
  },
  "token": "eyJhbGc..."
}
```

**Erreurs:**
- `400` - Champs manquants ou invalides
- `400` - Utilisateur déjà existant

---

### POST /auth/signin
Se connecter.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Réponse:** `200 OK`
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER"
  },
  "token": "eyJhbGc..."
}
```

**Erreurs:**
- `401` - Identifiants invalides

---

### GET /auth/profile
Récupérer le profil de l'utilisateur actuel.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:** `200 OK`
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### POST /auth/change-password
Changer le mot de passe de l'utilisateur actuel.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_secure_password"
}
```

**Réponse:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Erreurs:**
- `400` - Mot de passe actuel incorrect
- `401` - Non authentifié

---

## ✓ Validation de Tickets/Cartes

### POST /validation/submit
Soumettre une demande de validation.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "code": "ABC123DEF456",
  "brandId": "brand_id",
  "productType": "TICKET_PAIEMENT"
}
```

**Réponse:** `201 Created`
```json
{
  "id": "request_id",
  "status": "EN_ATTENTE",
  "submissionDate": "2024-01-15T10:00:00Z",
  "brand": "Paysafecard"
}
```

**Erreurs:**
- `400` - Code invalide (< 8 caractères)
- `400` - Code déjà soumis
- `400` - Marque non trouvée
- `401` - Non authentifié

---

### GET /validation/my-requests
Récupérer ses propres demandes de validation.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optionnel): `EN_ATTENTE`, `VALIDEE`, `REFUSEE`

**Réponse:** `200 OK`
```json
[
  {
    "id": "request_id",
    "status": "EN_ATTENTE",
    "brand": "Paysafecard",
    "submissionDate": "2024-01-15T10:00:00Z",
    "validationDate": null,
    "rejectionReason": null
  },
  {
    "id": "request_id_2",
    "status": "VALIDEE",
    "brand": "Amazon",
    "submissionDate": "2024-01-14T15:30:00Z",
    "validationDate": "2024-01-15T08:00:00Z",
    "rejectionReason": null
  }
]
```

---

### GET /validation/all
Récupérer TOUTES les demandes (Admin uniquement).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: `EN_ATTENTE`, `VALIDEE`, `REFUSEE`
- `brandId`: Filtrer par marque
- `startDate`: Date de début (ISO 8601)
- `endDate`: Date de fin (ISO 8601)

**Exemple:**
```
GET /validation/all?status=EN_ATTENTE&startDate=2024-01-01
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "request_id",
    "status": "EN_ATTENTE",
    "user": {
      "email": "user@example.com",
      "username": "john_doe"
    },
    "brand": {
      "name": "Paysafecard",
      "productType": "TICKET_PAIEMENT"
    },
    "submissionDate": "2024-01-15T10:00:00Z"
  }
]
```

---

### POST /validation/:requestId/validate
Valider une demande (Admin uniquement).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `requestId`: ID de la demande

**Body (optionnel):**
```json
{
  "comments": "Code vérifié et valide"
}
```

**Réponse:** `200 OK`
```json
{
  "id": "request_id",
  "status": "VALIDEE",
  "validationDate": "2024-01-15T11:00:00Z"
}
```

**Effets secondaires:**
- Email envoyé à l'utilisateur
- Audit log créé

**Erreurs:**
- `404` - Demande non trouvée
- `400` - Demande n'est pas en attente
- `403` - Non autorisé (rôle USER)

---

### POST /validation/:requestId/reject
Refuser une demande (Admin uniquement).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `requestId`: ID de la demande

**Body:**
```json
{
  "rejectionReason": "Code invalide ou déjà utilisé"
}
```

**Réponse:** `200 OK`
```json
{
  "id": "request_id",
  "status": "REFUSEE",
  "validationDate": "2024-01-15T11:00:00Z",
  "rejectionReason": "Code invalide ou déjà utilisé"
}
```

**Effets secondaires:**
- Email envoyé à l'utilisateur avec la raison
- Audit log créé

**Erreurs:**
- `400` - Raison de refus manquante
- `404` - Demande non trouvée
- `400` - Demande n'est pas en attente
- `403` - Non autorisé

---

## 🏷️ Marques (Brands)

### GET /brands
Récupérer toutes les marques actives.

**Réponse:** `200 OK`
```json
[
  {
    "id": "brand_id",
    "name": "Paysafecard",
    "productType": "TICKET_PAIEMENT",
    "description": "Payment tickets",
    "logoUrl": "https://..."
  }
]
```

---

### GET /brands/type/:productType
Récupérer les marques par type de produit.

**Path Parameters:**
- `productType`: `TICKET_PAIEMENT`, `CARTE_CADEAU`, `CARTE_BANCAIRE`

**Réponse:** `200 OK`
```json
[
  {
    "id": "brand_id",
    "name": "Netflix",
    "productType": "CARTE_CADEAU",
    "logoUrl": "https://..."
  }
]
```

---

### POST /brands
Créer une nouvelle marque (Admin uniquement).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "name": "New Brand",
  "productType": "CARTE_CADEAU",
  "description": "Description optionnelle",
  "logoUrl": "https://logo.url/image.png"
}
```

**Réponse:** `201 Created`
```json
{
  "id": "brand_id",
  "name": "New Brand",
  "productType": "CARTE_CADEAU",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

**Erreurs:**
- `400` - Marque déjà existe
- `403` - Non autorisé

---

### PATCH /brands/:brandId
Modifier une marque (Admin uniquement).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "name": "Updated Name",
  "description": "New description",
  "isActive": false
}
```

**Réponse:** `200 OK`
```json
{
  "id": "brand_id",
  "name": "Updated Name",
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

---

### DELETE /brands/:brandId
Supprimer une marque (Admin uniquement).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Réponse:** `200 OK`
```json
{
  "message": "Brand deleted successfully"
}
```

---

## 🏥 Health Check

### GET /health
Vérifier l'état du serveur.

**Réponse:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

---

## Codes d'Erreur

| Code | Signification |
|------|---------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Token invalide/expiré |
| 403 | Forbidden - Permissions insuffisantes |
| 404 | Not Found - Ressource non trouvée |
| 409 | Conflict - Ressource en double |
| 500 | Internal Server Error - Erreur serveur |

---

## Rate Limiting

Actuellement non implémenté. À ajouter pour production.

---

## Versioning

L'API est en version 1.0. Les changements majeurs seront versionnés.

---

## Webhooks (Future)

Les webhooks pour les notifications en temps réel seront implémentés ultérieurement.
