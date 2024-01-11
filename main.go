package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

func getPort() string {
	// Get the Port from the environment so we can run on Heroku
	port := os.Getenv("PORT")
	// Set a default port if there is nothing in the environment
	if port == "" {
		port = "3000"
	}
	return ":" + port
}

func main() {
	// Start a new fiber app
	app := fiber.New()

	// Send a string back for GET calls to the endpoint "/"
	app.Get("/", func(c *fiber.Ctx) error {
		err := c.SendString("And the API is UP!")
		return err
	})

	app.Listen(getPort())

	// Listen on PORT 3000
}
