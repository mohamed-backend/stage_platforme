import os, glob

replacements = {
    'Authentification requise.': 'Authentication required.',
    'Réclamation introuvable.': 'Claim not found.',
    'Accès interdit.': 'Forbidden.',
    'Une réclamation en cours de traitement ne peut plus être supprimée.': 'A claim in progress cannot be deleted.',
    "Action réservée à l'Assureur ou l'Admin.": 'Action reserved for Insurer or Admin.',
    'Le contenu de la note est requis.': 'Note content is required.',
    'Seuls les assureurs/admins peuvent créer des notes internes.': 'Only insurers/admins can create internal notes.',
    'Accès réservé aux assureurs et administrateurs.': 'Access reserved for insurers and administrators.',
    'Règle de couverture introuvable.': 'Coverage rule not found.',
    'Le type de rapport et le titre sont requis.': 'Report type and title are required.',
    'Type de rapport invalide.': 'Invalid report type.',
    'Investissement introuvable.': 'Investment not found.',
    'Accès réservé aux porteurs de projet.': 'Access reserved for project owners.',
    'Identifiant de projet invalide.': 'Invalid project ID.',
    'Pool introuvable.': 'Pool not found.',
    'Seul le porteur de projet peut créer un pool.': 'Only the project owner can create a pool.',
    'Projet introuvable.': 'Project not found.',
    'Non authentifié.': 'Unauthenticated.',
    'Seul le porteur du projet peut le soumettre.': 'Only the project owner can submit it.',
    'Accès réservé aux administrateurs.': 'Access reserved for administrators.',
    'Accès réservé aux administrateurs et assureurs.': 'Access reserved for administrators and insurers.',
    'Profil utilisateur non trouvé.': 'User profile not found.',
    'Vous avez déjà soumis votre KYC.': 'You have already submitted your KYC.',
    'Votre KYC doit être vérifié pour effectuer cette action.': 'Your KYC must be verified to perform this action.',
    'Action invalide.': 'Invalid action.',
    'Utilisateur introuvable.': 'User not found.',
    'Le statut doit être APPROVED ou REJECTED.': 'Status must be APPROVED or REJECTED.',
    'Le motif de rejet est obligatoire en cas de refus.': 'Rejection reason is required if rejected.',
    'Les mots de passe ne correspondent pas.': 'Passwords do not match.',
    'KYC introuvable.': 'KYC not found.',
    "Ce projet n'est pas éligible à la soumission.": 'This project is not eligible for submission.',
    "Le nom d'utilisateur existe déjà.": 'Username already exists.',
    "L'email existe déjà.": 'Email already exists.',
    'Mot de passe trop court.': 'Password too short.',
    'Vous ne pouvez pas supprimer votre propre compte.': 'You cannot delete your own account.',
    "Le montant de l'investissement doit être supérieur à 0.": 'Investment amount must be greater than 0.',
    'Le pool est obligatoire.': 'Pool is required.',
    'Le montant est obligatoire.': 'Amount is required.',
    "Ce pool n'est pas ouvert aux investissements.": 'This pool is not open for investments.',
    'Le montant demandé dépasse le montant restant du pool': 'The requested amount exceeds the remaining pool amount',
    "Vous devez être propriétaire de l'investissement pour le lister.": 'You must own the investment to list it.',
    'Prix introuvable.': 'Price not found.',
    'Le prix demandé ne peut pas être négatif ou nul.': 'Asking price cannot be negative or zero.',
    'Le prix demandé doit être supérieur à 0.': 'Asking price must be greater than 0.',
    'Seuls les investisseurs dont le KYC est vérifié peuvent lister des investissements.': 'Only investors with verified KYC can list investments.',
    'Listing introuvable.': 'Listing not found.',
    'Vous ne pouvez pas acheter votre propre listing.': 'You cannot buy your own listing.',
    "Ce listing n'est plus disponible.": 'This listing is no longer available.',
    'Fonds insuffisants.': 'Insufficient funds.',
    'Projet publié avec succès.': 'Project published successfully.'
}

for filepath in glob.glob('backend/**/*.py', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for fr, en in replacements.items():
        new_content = new_content.replace(fr, en)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')
