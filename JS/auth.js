document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = e.target.querySelectorAll('input');
    const data = {
        firstName: inputs[0].value,
        lastName: inputs[1].value,
        email: inputs[2].value,
        password: inputs[3].value,
        nickname: inputs[4].value,
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const resData = await response.json();
            localStorage.setItem('token', resData.token);
            window.location.href = 'profile.html';
        } else {
            const err = await response.json();
            alert('Помилка: ' + err.message);
        }
    } catch (err) {
        alert('Сталася помилка при реєстрації.');
    }
});
