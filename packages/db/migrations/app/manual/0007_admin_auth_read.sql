-- L'administration lit l'adresse, la vérification, le mode de connexion et la dernière visite des comptes.
-- Droits par colonne : ni jeton, ni mot de passe, ni adresse IP, et uniquement pour le rôle d'administration.
-- Politiques RLS : sans elles, ce rôle lit 0 ligne dès que la RLS est activée sur la table (constaté sur `account`).
-- Elles restent sans effet tant que la RLS est désactivée. Rejouable. À appliquer après le provisionnement de Neon Auth.
GRANT USAGE ON SCHEMA neon_auth TO restio_admin_ops;
GRANT SELECT (id, name, email, "emailVerified", "createdAt") ON neon_auth."user" TO restio_admin_ops;
GRANT SELECT ("userId", "providerId") ON neon_auth.account TO restio_admin_ops;
GRANT SELECT ("userId", "updatedAt") ON neon_auth.session TO restio_admin_ops;

DROP POLICY IF EXISTS restio_admin_ops_read ON neon_auth."user";
CREATE POLICY restio_admin_ops_read ON neon_auth."user" FOR SELECT TO restio_admin_ops USING (true);
DROP POLICY IF EXISTS restio_admin_ops_read ON neon_auth.account;
CREATE POLICY restio_admin_ops_read ON neon_auth.account FOR SELECT TO restio_admin_ops USING (true);
DROP POLICY IF EXISTS restio_admin_ops_read ON neon_auth.session;
CREATE POLICY restio_admin_ops_read ON neon_auth.session FOR SELECT TO restio_admin_ops USING (true);
