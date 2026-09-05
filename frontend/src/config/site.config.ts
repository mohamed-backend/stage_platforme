export const siteConfig = {
  brand: {
    name: 'Fundsy',
    initials: 'FS',
    description: "La plateforme fintech d'investissement participatif nouvelle génération. Connectez votre capital aux projets d'avenir les plus prometteurs en toute transparence.",
    compliance: 'Plateforme enregistrée & auditée',
  },
  social: [
    { label: 'X', url: '#', icon: 'x' },
    { label: 'LinkedIn', url: '#', icon: 'linkedin' },
    { label: 'Facebook', url: '#', icon: 'facebook' },
    { label: 'Email', url: 'mailto:contact@fundsy.fr', icon: 'mail' },
  ],
  navigation: {
    platform: [
      { label: 'Investir', to: '/projects' },
      { label: 'Marché secondaire', to: '/market' },
      { label: 'Comment ça marche', to: '/about' },
      { label: 'Tous les projets', to: '/projects' },
      { label: 'Pools de liquidité', to: '/pools' },
    ],
    company: [
      { label: 'À propos', to: '/about' },
      { label: 'Contact', url: 'mailto:contact@fundsy.fr' },
      { label: 'Carrières', disabled: true },
      { label: 'Presse & Médias', disabled: true },
    ],
    legal: [
      { label: 'Politique de confidentialité', disabled: true },
      { label: 'Conditions générales d\'utilisation', disabled: true },
      { label: 'Gestion des cookies', disabled: true },
      { label: 'Mentions légales', disabled: true },
    ],
  },
  footer: {
    copyright: (year: number) => `© ${year} Fundsy SAS. Tous droits réservés.`,
    disclaimer: "Avertissement : L'investissement dans des entreprises non cotées comporte des risques de perte partielle ou totale du capital investi et un risque d'illiquidité.",
  },
} as const
