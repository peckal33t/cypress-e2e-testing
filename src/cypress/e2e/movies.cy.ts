describe("Movies Home Page", () => {
	beforeEach(() => {
		cy.visit("/")
	})

	const formEl = ".form-control"
	const movieCard = ".movie-list"
	const warningPopUp = ".fade"
	const alertMsg = ".alert-heading"

	context("Mostly Mundane Movies", () => {
		it("Can't search without entering a title", () => {
			cy.get(formEl).type("{enter}")
			cy.get(warningPopUp).should("be.visible")
			cy.get(alertMsg).contains("Aww, that's cute").should("be.visible")
		})

		it("Can't search without entering at least 3 characters", () => {
			cy.get(formEl).type("42").type("{enter}")
			cy.get(warningPopUp).should("be.visible")
			cy.get(alertMsg)
				.contains("Wow, that was stupid")
				.should("be.visible")
		})

		it("Can search for The Matrix and get at least X number of hits", () => {
			cy.get(formEl).type("The Matrix").type("{enter}")
			cy.get(movieCard).should("be.visible")
			cy.get(movieCard).find(".card").should("have.length", 10)
		})

		it("Should appear a loading spinner while searching", () => {
			cy.get(formEl).type("1337").type("{enter}")
			cy.get("#loading-wrapper").should("be.visible")
		})

		it("Can click on the first search hit and the page you end up on must match the ID", () => {
			cy.get(formEl).type("Anonymous").type("{enter}")
			cy.get(movieCard).should("be.visible")
			cy.get(".card-link").eq(0).click()
			cy.url().should("include", "/movies/")
			cy.location("pathname").should("equal", "/movies/tt1521197")
		})

		it("Should not show the loading spinner when the search result is displayed", () => {
			cy.get(formEl).type("The Batman").type("{enter}")
			cy.get("#loading-wrapper").should("be.visible")
			cy.get(movieCard).should("be.visible")
			cy.get("#loading-wrapper").should("not.exist")
		})

		it("Can search for “Cat Memes” and get no hits", () => {
			cy.get(formEl).type("Cat Memes").type("{enter}")
			cy.get(movieCard).should("not.exist")
			cy.get(warningPopUp)
				.should("be.visible")
				.contains("Movie not found!")
				.should("be.visible")
		})

		it("Should timeout the request and you will recieve an error message if you search for “The Postman always rings twice”", () => {
			cy.get(formEl)
				.type("The Postman always rings twice")
				.type("{enter}")
			cy.wait(5000)
			cy.get(warningPopUp)
				.should("be.visible")
				.get(alertMsg)
				.should("be.visible")
				.get("p")
				.contains("Does he, really?")
				.should("be.visible")
		})

		it("Should get and display an error message if you enter the path for the movie with id “tt1337”", () => {
			cy.visit("/movies/tt1337")
			cy.get(warningPopUp)
				.should("be.visible")
				.get(alertMsg)
				.contains("LOL, what a fail")
				.should("be.visible")
				.get("p")
				.contains("Haxx0r now, are we?")
				.should("be.visible")
		})

		it("Should display an error message if you go to a page that does not exist", () => {
			cy.visit("/hax")
			cy.get(warningPopUp)
				.should("be.visible")
				.get(alertMsg)
				.contains("It's not us, it's you")
				.should("be.visible")
				.get("p")
				.contains(
					"That page does not exist. You should be ashamed of yourself."
				)
				.should("be.visible")
				.get(".btn")
				.should("be.visible")
		})

		it("Should mock the SEARCH and GET request for “The Matrix”", () => {
			cy.intercept(
				"GET",
				"https://www.omdbapi.com/?s=The%20Matrix&type=movie&apikey=c407a477",
				{
					fixture: "searchResponse.json",
				}
			).as("searchRequest")
			cy.intercept(
				"GET",
				"https://www.omdbapi.com/?i=tt0133093&apikey=c407a477",
				{
					fixture: "movieResponse.json",
				}
			).as("movieRequest")
			cy.get(formEl).type("The Matrix").type("{enter}")
			cy.wait("@searchRequest")
			cy.get(movieCard).should("be.visible")
			cy.get(".card-body")
				.eq(0)
				.contains("The Matrix Be Born")
				.should("be.visible")
			cy.get(".card-link").eq(0).click()
			cy.wait("@movieRequest")
			cy.get(".card-body").should("be.visible")
			cy.get(".card-title")
				.should("be.visible")
				.contains("The Matrix Be Born")
			cy.get(".mb-2").contains("1942").should("be.visible")
		})
	})
})
