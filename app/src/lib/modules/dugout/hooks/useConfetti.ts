import confetti from 'canvas-confetti';

export function useConfetti(duration = 15000) {
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 50,
        spread: 360, 
        ticks: 60, 
        zIndex: 0,
        gravity: 1.0 // Stronger gravity for falling effect
    };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    function startConfetti() {
        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // Start confetti from the left side
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: 0 },
                    speed: randomInRange(2, 5) // Adjusted speed for falling effect
                })
            );

            // Start confetti from the right side
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: 0 },
                    speed: randomInRange(2, 5) // Adjusted speed for falling effect
                })
            );

            // Additional falling effect adjustments can be made here if needed
        }, 250);
    }

    return { startConfetti };
}