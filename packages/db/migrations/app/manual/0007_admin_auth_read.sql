-- L'administration lit l'adresse, la vérification, le mode de connexion et la dernière visite des comptes.
-- Droits par colonne : ni jeton, ni mot de passe, ni adresse IP, et uniquement pour le rôle d'administration.
-- Rejouable. À appliquer après le provisionnement de Neon Auth sur la branche.
GRANT USAGE ON SCHEMA neon_auth TO restio_admin_ops;
GRANT SELECT (id, name, email, "emailVerified", "createdAt") ON neon_auth."user" TO restio_admin_ops;
GRANT SELECT ("userId", "providerId") ON neon_auth.account TO restio_admin_ops;
GRANT SELECT ("userId", "updatedAt") ON neon_auth.session TO restio_admin_ops;
