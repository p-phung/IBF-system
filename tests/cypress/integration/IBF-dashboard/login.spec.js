describe('Login Page', () => {
  beforeEach(() => {
    cy.server();
  });

  // Real API call
  it('lets the user log in', function () {
    cy.fixture('login').then((login) => {
      cy.visit(login.portal);

      cy.get('input[name="email"]').type(login.email);
      cy.get('input[name="password"]').type(login.password);
      cy.contains('Log In').click();

      cy.get('[data-cy=logged-in-as]').contains('Logged In As:')
      cy.url().should("include", "/", () => {
        expect(localStorage.getItem("jwt")).to.exist()
      })
    });
  });
});