"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const sampleWebsites = [
        {
            title: 'Photography Portfolio',
            description: 'A modern portfolio website for a professional photographer',
            prompt: 'Create a portfolio website for a photographer with a dark theme, gallery section, and contact form',
            htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photography Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">John Doe Photography</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#gallery">Gallery</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="home" class="hero">
            <h1>Capturing Life's Beautiful Moments</h1>
            <p>Professional photography services for weddings, portraits, and events</p>
            <button class="cta-button">View Gallery</button>
        </section>
        <section id="gallery" class="gallery">
            <h2>Portfolio Gallery</h2>
            <div class="gallery-grid">
                <div class="gallery-item">Photo 1</div>
                <div class="gallery-item">Photo 2</div>
                <div class="gallery-item">Photo 3</div>
                <div class="gallery-item">Photo 4</div>
            </div>
        </section>
        <section id="about" class="about">
            <h2>About Me</h2>
            <p>With over 10 years of experience in photography, I specialize in capturing authentic moments and creating timeless memories.</p>
        </section>
        <section id="contact" class="contact">
            <h2>Get In Touch</h2>
            <form>
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <textarea placeholder="Your Message" required></textarea>
                <button type="submit">Send Message</button>
            </form>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 John Doe Photography. All rights reserved.</p>
    </footer>
</body>
</html>`,
            cssContent: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #1a1a1a;
    color: #fff;
}

header {
    background: rgba(0, 0, 0, 0.9);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    color: #fff;
    text-decoration: none;
    transition: color 0.3s;
}

nav a:hover {
    color: #ff6b6b;
}

.hero {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('hero-bg.jpg');
    background-size: cover;
    background-position: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.cta-button {
    background: #ff6b6b;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s;
}

.cta-button:hover {
    background: #ff5252;
}

.gallery {
    padding: 4rem 2rem;
    background: #2a2a2a;
}

.gallery h2 {
    text-align: center;
    margin-bottom: 3rem;
    font-size: 2.5rem;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.gallery-item {
    height: 300px;
    background: #444;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: transform 0.3s;
}

.gallery-item:hover {
    transform: scale(1.05);
}

.about, .contact {
    padding: 4rem 2rem;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

.about h2, .contact h2 {
    margin-bottom: 2rem;
    font-size: 2.5rem;
}

.contact form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
}

.contact input, .contact textarea {
    padding: 1rem;
    border: 1px solid #555;
    border-radius: 5px;
    background: #333;
    color: #fff;
}

.contact button {
    background: #ff6b6b;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 5px;
    font-size: 1.1rem;
    cursor: pointer;
}

footer {
    background: #000;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}`,
            isPublic: true,
            metadata: {
                category: 'portfolio',
                theme: 'dark',
                features: ['gallery', 'contact-form', 'responsive']
            }
        },
        {
            title: 'Restaurant Landing Page',
            description: 'A beautiful landing page for a local restaurant',
            prompt: 'Create a restaurant website with menu, reservations, and location information',
            htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bella Vista Restaurant</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">Bella Vista</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#reservations">Reservations</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="home" class="hero">
            <h1>Welcome to Bella Vista</h1>
            <p>Authentic Italian cuisine in the heart of the city</p>
            <button class="cta-button">Make a Reservation</button>
        </section>
        <section id="menu" class="menu">
            <h2>Our Menu</h2>
            <div class="menu-categories">
                <div class="menu-category">
                    <h3>Appetizers</h3>
                    <div class="menu-item">
                        <h4>Bruschetta</h4>
                        <p>Fresh tomatoes, basil, and mozzarella on toasted bread</p>
                        <span class="price">$12</span>
                    </div>
                </div>
                <div class="menu-category">
                    <h3>Main Courses</h3>
                    <div class="menu-item">
                        <h4>Spaghetti Carbonara</h4>
                        <p>Classic Roman pasta with eggs, cheese, and pancetta</p>
                        <span class="price">$18</span>
                    </div>
                </div>
            </div>
        </section>
        <section id="reservations" class="reservations">
            <h2>Make a Reservation</h2>
            <form>
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <input type="date" required>
                <input type="time" required>
                <input type="number" placeholder="Number of Guests" min="1" required>
                <button type="submit">Reserve Table</button>
            </form>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Bella Vista Restaurant. All rights reserved.</p>
    </footer>
</body>
</html>`,
            cssContent: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Georgia', serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: #8B4513;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.logo {
    font-size: 2rem;
    font-weight: bold;
    color: #FFD700;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    color: #fff;
    text-decoration: none;
    transition: color 0.3s;
}

nav a:hover {
    color: #FFD700;
}

.hero {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('restaurant-bg.jpg');
    background-size: cover;
    background-position: center;
    color: white;
}

.hero h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
}

.cta-button {
    background: #FFD700;
    color: #8B4513;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
}

.cta-button:hover {
    background: #FFA500;
}

.menu, .reservations {
    padding: 4rem 2rem;
    background: #F5F5DC;
}

.menu h2, .reservations h2 {
    text-align: center;
    margin-bottom: 3rem;
    font-size: 2.5rem;
    color: #8B4513;
}

.menu-categories {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 3rem;
}

.menu-category h3 {
    color: #8B4513;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    border-bottom: 2px solid #8B4513;
    padding-bottom: 0.5rem;
}

.menu-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-item h4 {
    color: #8B4513;
    margin-bottom: 0.5rem;
}

.menu-item p {
    color: #666;
    font-size: 0.9rem;
    flex: 1;
    margin-right: 1rem;
}

.price {
    font-weight: bold;
    color: #8B4513;
    font-size: 1.2rem;
}

.reservations form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
}

.reservations input {
    padding: 1rem;
    border: 2px solid #8B4513;
    border-radius: 5px;
    font-size: 1rem;
}

.reservations button {
    grid-column: 1 / -1;
    background: #8B4513;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 5px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background 0.3s;
}

.reservations button:hover {
    background: #A0522D;
}

footer {
    background: #8B4513;
    color: white;
    text-align: center;
    padding: 2rem;
}`,
            isPublic: true,
            metadata: {
                category: 'restaurant',
                theme: 'warm',
                features: ['menu', 'reservations', 'responsive']
            }
        }
    ];
    for (const website of sampleWebsites) {
        await prisma.website.create({
            data: website,
        });
    }
    console.log('✅ Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map