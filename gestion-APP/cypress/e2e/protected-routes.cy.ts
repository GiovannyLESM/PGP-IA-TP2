describe('🔒 Rutas protegidas sin autenticación', () => {
  beforeEach(() => {
    // Asegurarse de que no hay sesión guardada
    cy.clearLocalStorage();
  });

  it('Redirige a /login si intenta acceder a /dashboard sin estar logueado', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('Redirige a /login si intenta acceder a /perfil sin estar logueado', () => {
    cy.visit('/perfil');
    cy.url().should('include', '/login');
  });

  it('Permite acceder a /dashboard si el usuario está logueado', () => {
    // Login real
    cy.visit('/login');
    cy.get('input[name="correo"]').type('blesscker@demo.com'); // cambia al tuyo
    cy.get('input[name="password"]').type('1234567');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido').should('exist'); // o algo que esté visible
  });

  it('Permite acceder a /profile si el usuario está logueado', () => {
  // Login real
    cy.visit('/login');
    cy.get('input[name="correo"]').type('blesscker@demo.com');
    cy.get('input[name="password"]').type('1234567');
    cy.get('button[type="submit"]').click();

    // Verifica que entró al dashboard primero
    cy.url().should('include', '/dashboard');

    // Luego visita el perfil
    cy.visit('/profile');

    // Verifica que carga correctamente
    cy.contains('👤 Perfil del Usuario').should('exist');
    cy.get('p.text-xl.font-semibold').should('exist'); // nombre
    cy.get('p.text-gray-600.text-sm').should('exist'); // correo
    });
  // Agrega más rutas protegidas si tu app las tiene
});
