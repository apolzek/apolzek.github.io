Autenticação (provar identidade)
OpenID Connect (OIDC) é o padrão moderno por excelência. É uma camada de identidade construída sobre o OAuth 2.0, e é o que está por trás do "Entrar com Google/Microsoft/Apple". Hoje é a escolha default para autenticação em aplicações web e mobile.
SAML 2.0 é o veterano baseado em XML, ainda dominante em ambientes corporativos para SSO (Single Sign-On), especialmente integrando com sistemas legados e provedores de identidade empresariais como Okta, Azure AD/Entra ID e ADFS.
JWT (JSON Web Tokens) não é um protocolo de autenticação em si, mas o formato de token mais usado para carregar as informações (claims) do usuário de forma assinada e stateless — muito comum em APIs REST e arquiteturas de microsserviços.
Passkeys / WebAuthn / FIDO2 representam a tendência mais forte do momento: autenticação passwordless usando biometria ou chaves de segurança, eliminando senhas. Tem ganhado adoção rápida porque resiste a phishing.
MFA / 2FA (autenticação multifator) virou praticamente obrigatório, combinando senha com TOTP (apps como Google Authenticator), push notifications ou SMS.
mTLS (mutual TLS) é autenticação por certificados, muito usado em comunicação serviço-a-serviço e arquiteturas Zero Trust.
Ainda existem os mais simples: sessões baseadas em cookie (o modelo tradicional server-side), API keys (para integrações máquina-a-máquina) e Basic Auth (usuário/senha, sempre sobre HTTPS).
Autorização (definir permissões)
RBAC (Role-Based Access Control) é de longe o mais usado. Você agrupa permissões em papéis (admin, editor, viewer) e atribui papéis aos usuários. Simples e suficiente para a maioria dos casos.
ABAC (Attribute-Based Access Control) é mais granular e baseado em políticas, decidindo o acesso a partir de atributos do usuário, do recurso e do contexto (ex.: "só pode acessar se for do mesmo departamento e dentro do horário comercial").
ReBAC (Relationship-Based Access Control) ganhou destaque com o modelo Google Zanzibar e ferramentas como OpenFGA e SpiceDB. Define acesso com base em relacionamentos entre entidades — é o que permite coisas como "quem tem acesso a esta pasta também tem acesso aos arquivos dentro dela", algo típico de produtos como Google Drive.
Scopes do OAuth são a forma padrão de limitar o que um token pode fazer em APIs (ex.: read:profile, write:posts).
Para implementar políticas mais complexas de forma desacoplada, é comum usar engines como OPA (Open Policy Agent) ou bibliotecas como Casbin.

Na prática, a combinação mais comum hoje em aplicações modernas é OIDC + JWT para autenticação e RBAC para autorização, frequentemente delegando tudo isso para provedores como Auth0, Keycloak, Okta, Firebase Auth ou AWS Cognito em vez de implementar do zero.