const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        appearOnScroll.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

tsParticles.load("tsparticles", {
    fullScreen: {
        enable: true,
        zIndex: -3
    },
    particles: {
        number: {
            value: 70,
            density: {
                enable: true,
                area: 1000
            }
        },
        color: {
            value: ["#00D1FF", "#9B5DE5"]
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.3
        },
        size: {
            value: { min: 1, max: 4 }
        },
        move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            outModes: {
                default: "bounce"
            }
        },
        links: {
            enable: true,
            distance: 120,
            color: "#00D1FF",
            opacity: 0.2,
            width: 1
        }
    },
    background: {
        color: "transparent"
    }
});
