// ==============================
// PRABANJAN PORTFOLIO
// Interactive JavaScript
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // =================================
    // 1. MOBILE NAVIGATION
    // =================================

    const menuButton = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {

        menuButton.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("open");

            menuButton.textContent = isOpen ? "✕" : "☰";

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

        document.querySelectorAll(".nav-links a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");
                menuButton.textContent = "☰";
                menuButton.setAttribute("aria-expanded", "false");

            });

        });
    }

    // =================================
    // 2. TYPING ANIMATION
    // =================================

    const typingElement = document.getElementById("typing-text");

    const words = [
        "Web Developer",
        "BCA Student",
        "Python Enthusiast",
        "AI Explorer"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeEffect() {

        if (!typingElement) return;

        const currentWord = words[wordIndex];

        if (deleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        typingElement.textContent =
            currentWord.substring(0, charIndex);

        let speed = deleting ? 55 : 100;

        if (!deleting && charIndex === currentWord.length) {

            deleting = true;
            speed = 1500;

        } else if (deleting && charIndex === 0) {

            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 400;

        }

        setTimeout(typeEffect, speed);
    }

    if (typingElement) {

        if (reduceMotion) {
            typingElement.textContent = "Web Developer";
        } else {
            typeEffect();
        }

    }

    // =================================
    // 3. SCROLL PROGRESS BAR
    // =================================

    const progressBar = document.querySelector(".scroll-progress");

    // =================================
    // 4. BACK TO TOP
    // =================================

    const topButton = document.getElementById("back-to-top");

    function updateScroll() {

        const scrollable =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress = scrollable > 0
            ? (window.scrollY / scrollable) * 100
            : 0;

        if (progressBar) {
            progressBar.style.width = progress + "%";
        }

        if (topButton) {
            topButton.classList.toggle(
                "show",
                window.scrollY > 400
            );
        }

    }

    window.addEventListener("scroll", updateScroll, {
        passive: true
    });

    updateScroll();

    if (topButton) {

        topButton.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: reduceMotion ? "instant" : "smooth"
            });

        });

    }

    // =================================
    // 5. SCROLL REVEAL
    // =================================

    const revealElements = document.querySelectorAll(
        ".section-label, .section > h2, .glass-card, .skill-card"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");
                        observer.unobserve(entry.target);

                    }

                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach(element => {
            element.classList.add("reveal");
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("show");
        });

    }

    // =================================
    // 6. PROJECT FILTERING
    // =================================

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const projectCards =
        document.querySelectorAll(".project-card");

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter = button.dataset.filter;

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            projectCards.forEach(card => {

                const category = card.dataset.category;

                const shouldShow =
                    filter === "all" || category === filter;

                card.classList.toggle("hide", !shouldShow);

                if (shouldShow) {
                    card.classList.add("show");
                }

            });

        });

    });

    // =================================
    // 7. ACTIVE NAVIGATION
    // =================================

    const sections = document.querySelectorAll(
        "#home, #about, #skills, #projects, #education, #contact"
    );

    const navItems = document.querySelectorAll(".nav-links a");

    if ("IntersectionObserver" in window) {

        const sectionObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        navItems.forEach(link => {

                            link.classList.toggle(
                                "active",
                                link.getAttribute("href") ===
                                "#" + entry.target.id
                            );

                        });

                    }

                });
            },
            {
                rootMargin: "-25% 0px -60% 0px"
            }
        );

        sections.forEach(section => {
            sectionObserver.observe(section);
        });

    }

    // =================================
    // 8. NAVBAR SCROLL EFFECT
    // =================================

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if (navbar) {

            navbar.style.background =
                window.scrollY > 50
                    ? "rgba(12,7,25,0.96)"
                    : "rgba(20,13,36,0.78)";

        }

    }, { passive: true });

    // =================================
    // 9. CUSTOM MOUSE GLOW
    // =================================

    const cursorGlow = document.querySelector(".cursor-glow");

    if (
        cursorGlow &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {

        window.addEventListener("mousemove", event => {

            cursorGlow.style.left = event.clientX + "px";
            cursorGlow.style.top = event.clientY + "px";

        }, { passive: true });

    }

    // =================================
    // 10. 3D PROJECT CARD EFFECT
    // =================================

    if (!reduceMotion && window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches) {

        projectCards.forEach(card => {

            card.addEventListener("mousemove", event => {

                if (card.classList.contains("hide")) return;

                const rect = card.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - 0.5) * 8;

                const rotateX =
                    ((0.5 - y / rect.height) * 8);

                card.style.transform =
                    `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;

            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });

        });

    }

    // =================================
    // 11. PARTICLE BACKGROUND
    // =================================

    if (!reduceMotion) {

        const canvas = document.createElement("canvas");

        canvas.id = "particles-canvas";

        document.body.prepend(canvas);

        const ctx = canvas.getContext("2d");

        let particles = [];
        let width;
        let height;
        let animationId;

        function resizeCanvas() {

            width = window.innerWidth;
            height = window.innerHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(
                Math.floor((width * height) / 18000),
                65
            );

            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.8 + 0.5,
                speedX: (Math.random() - 0.5) * 0.35,
                speedY: (Math.random() - 0.5) * 0.35
            }));

        }

        function animateParticles() {

            ctx.clearRect(0, 0, width, height);

            particles.forEach(particle => {

                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0 || particle.x > width) {
                    particle.speedX *= -1;
                }

                if (particle.y < 0 || particle.y > height) {
                    particle.speedY *= -1;
                }

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "rgba(185,140,255,0.55)";
                ctx.fill();

            });

            animationId = requestAnimationFrame(animateParticles);

        }

        resizeCanvas();
        animateParticles();

        window.addEventListener("resize", resizeCanvas);

        document.addEventListener("visibilitychange", () => {

            if (document.hidden) {

                cancelAnimationFrame(animationId);

            } else {

                cancelAnimationFrame(animationId);
                animateParticles();

            }

        });

    }

    // =================================
    // 12. FOOTER YEAR
    // =================================

    const footer = document.querySelector("footer p");

    if (footer) {
        footer.textContent =
            `© ${new Date().getFullYear()} Prabanjan A. All Rights Reserved.`;
    }

    console.log("Prabanjan Advanced Portfolio Loaded!");

});